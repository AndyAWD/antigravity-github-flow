#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');

const safeGit = (cmdArgs, options = {}) => {
  try {
    return execFileSync('git', cmdArgs, {
      encoding: 'utf8',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      ...options,
    }).trim();
  } catch {
    return null;
  }
};

const runGit = (cmdArgs, options = {}) => {
  return execFileSync('git', cmdArgs, {
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    ...options,
  });
};

function main() {
  const isRepo = safeGit(['rev-parse', '--is-inside-work-tree']) === 'true';
  if (!isRepo) {
    const res = { success: false, error: 'not_a_repo', message: '目前目錄不是 Git 儲存庫。' };
    if (jsonOutput) console.log(JSON.stringify(res, null, 2));
    else console.error(res.message);
    process.exit(1);
  }

  const remotesRaw = safeGit(['remote']);
  const remotes = remotesRaw ? remotesRaw.split('\n').filter(Boolean) : [];
  if (remotes.length === 0) {
    const res = {
      success: true,
      warning: 'no_remote',
      message: '尚未設定任何遠端儲存庫（remote），無需執行 fetch。',
    };
    if (jsonOutput) console.log(JSON.stringify(res, null, 2));
    else console.log(res.message);
    process.exit(0);
  }

  // 1. 執行遠端全部擷取（含標籤與修剪已刪除的遠端追蹤分支）
  let fetchError = null;
  try {
    execFileSync('git', ['fetch', '--all', '--prune', '--tags'], {
      encoding: 'utf8',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
  } catch (e) {
    fetchError = (e.stdout || e.stderr || e.message || '').trim();
  }

  // 2. 獲取當前所在分支與所有工作樹（Worktree）中已簽出的分支
  const currentBranch = safeGit(['symbolic-ref', '--short', 'HEAD']) || null;
  const worktreesRaw = safeGit(['worktree', 'list', '--porcelain']);
  const checkedOutBranches = new Set();
  if (worktreesRaw) {
    for (const line of worktreesRaw.split('\n')) {
      if (line.startsWith('branch refs/heads/')) {
        checkedOutBranches.add(line.replace('branch refs/heads/', ''));
      }
    }
  }
  if (currentBranch) {
    checkedOutBranches.add(currentBranch);
  }

  // 3. 獲取所有本地分支與其 upstream 狀態
  const branchRefsRaw = safeGit([
    'for-each-ref',
    '--format=%(refname:short)|%(upstream:short)',
    'refs/heads',
  ]);
  const branchLines = branchRefsRaw ? branchRefsRaw.split('\n').filter(Boolean) : [];

  const branchResults = [];

  for (const line of branchLines) {
    const [branch, upstream] = line.split('|');

    if (branch === currentBranch) {
      branchResults.push({
        branch,
        isCurrent: true,
        status: 'skipped_current',
        message: '目前所在分支（依規範由 pull 指令負責更新工作區，fetch 階段安全跳過）',
      });
      continue;
    }

    if (checkedOutBranches.has(branch)) {
      branchResults.push({
        branch,
        isCurrent: false,
        status: 'checked_out_in_worktree',
        message: '該分支已在其他工作樹中簽出，略過（不行的話就算了）',
      });
      continue;
    }

    let targetUpstream = upstream;
    let remoteName = '';
    let remoteBranch = '';

    if (targetUpstream) {
      const slashIdx = targetUpstream.indexOf('/');
      if (slashIdx !== -1) {
        remoteName = targetUpstream.slice(0, slashIdx);
        remoteBranch = targetUpstream.slice(slashIdx + 1);
      }
    } else {
      for (const r of remotes) {
        const check = safeGit(['rev-parse', '--verify', `${r}/${branch}`]);
        if (check) {
          remoteName = r;
          remoteBranch = branch;
          targetUpstream = `${r}/${branch}`;
          break;
        }
      }
    }

    if (!targetUpstream || !remoteName) {
      branchResults.push({
        branch,
        isCurrent: false,
        status: 'no_remote_tracking',
        message: '無對應的遠端追蹤分支，保持原狀（不行的話就算了）',
      });
      continue;
    }

    const localSha = safeGit(['rev-parse', `refs/heads/${branch}`]);
    const upstreamSha = safeGit(['rev-parse', targetUpstream]);

    if (!upstreamSha) {
      branchResults.push({
        branch,
        isCurrent: false,
        status: 'upstream_not_found',
        message: '遠端分支參照不存在，略過（不行的話就算了）',
      });
      continue;
    }

    if (localSha === upstreamSha) {
      branchResults.push({
        branch,
        isCurrent: false,
        status: 'up_to_date',
        message: '已是最新狀態',
      });
      continue;
    }

    const isAncestor = safeGit(['merge-base', '--is-ancestor', `refs/heads/${branch}`, targetUpstream]) !== null;

    if (!isAncestor) {
      branchResults.push({
        branch,
        isCurrent: false,
        status: 'diverged_or_ahead',
        message: '本地有未推播提交或分叉，無法快轉，安全略過（不行的話就算了）',
      });
      continue;
    }

    let updateSuccess = false;
    let updateError = null;

    try {
      runGit(['fetch', '.', `${targetUpstream}:${branch}`]);
      updateSuccess = true;
    } catch (e1) {
      try {
        runGit(['update-ref', `refs/heads/${branch}`, upstreamSha, localSha]);
        updateSuccess = true;
      } catch (e2) {
        updateError = e2.message || e1.message;
      }
    }

    if (updateSuccess) {
      branchResults.push({
        branch,
        isCurrent: false,
        status: 'updated',
        message: `已順利快轉更新至最新遠端節點 (${upstreamSha.slice(0, 7)})`,
      });
    } else {
      branchResults.push({
        branch,
        isCurrent: false,
        status: 'failed',
        message: `快轉更新失敗，略過（不行的話就算了）：${updateError}`,
      });
    }
  }

  let currentBranchStatus = null;
  if (currentBranch) {
    const curUpstream = safeGit(['rev-parse', '--abbrev-ref', '@{u}']);
    if (curUpstream) {
      const counts = safeGit(['rev-list', '--left-right', '--count', `HEAD...${curUpstream}`]);
      if (counts) {
        const [ahead, behind] = counts.split(/\s+/).map(Number);
        currentBranchStatus = {
          branch: currentBranch,
          upstream: curUpstream,
          ahead,
          behind,
          message:
            behind > 0
              ? `目前分支落後遠端 ${behind} 個提交，建議執行 pull 進行整合更新。`
              : ahead > 0
              ? `目前分支超前遠端 ${ahead} 個提交。`
              : '目前分支已是最新狀態。',
        };
      }
    } else {
      currentBranchStatus = {
        branch: currentBranch,
        upstream: null,
        message: '目前分支尚未設定遠端追蹤。',
      };
    }
  }

  const result = {
    success: true,
    fetchError,
    remotes,
    currentBranch,
    currentBranchStatus,
    branchResults,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('=== 遠端狀態擷取完成（Fetch）===');
    console.log(`- 遠端儲存庫：${remotes.join(', ')}`);
    console.log(`- 目前所在分支：${currentBranch || '(分離 HEAD)'}`);
    if (currentBranchStatus) {
      console.log(`- 目前分支狀態：${currentBranchStatus.message}`);
    }
    if (fetchError) {
      console.log(`- 遠端擷取警示：${fetchError}`);
    }
    console.log('\n=== 本地分支同步結果 ===');
    for (const b of branchResults) {
      if (b.isCurrent) {
        console.log(`- ${b.branch}: [當前分支] ${b.message}`);
      } else {
        console.log(`- ${b.branch}: [${b.status}] ${b.message}`);
      }
    }
  }
}

main();
