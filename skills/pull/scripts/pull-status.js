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

function main() {
  const isRepo = safeGit(['rev-parse', '--is-inside-work-tree']) === 'true';
  if (!isRepo) {
    const res = { status: 'NOT_A_REPO', message: '目前目錄不是 Git 儲存庫。' };
    if (jsonOutput) console.log(JSON.stringify(res, null, 2));
    else console.error(res.message);
    process.exit(1);
  }

  const remotesRaw = safeGit(['remote']);
  const remotes = remotesRaw ? remotesRaw.split('\n').filter(Boolean) : [];
  if (remotes.length === 0) {
    const res = { status: 'NO_REMOTE', message: '尚未設定任何遠端儲存庫（remote）。' };
    if (jsonOutput) console.log(JSON.stringify(res, null, 2));
    else console.log(res.message);
    process.exit(0);
  }

  const currentBranch = safeGit(['symbolic-ref', '--short', 'HEAD']);
  if (!currentBranch) {
    const headCommit = safeGit(['rev-parse', '--short', 'HEAD']) || '未知';
    const res = {
      status: 'DETACHED_HEAD',
      headCommit,
      message: `目前處於分離 HEAD 狀態（位於提交 ${headCommit}），未綁定任何分支。`,
    };
    if (jsonOutput) console.log(JSON.stringify(res, null, 2));
    else console.log(res.message);
    process.exit(0);
  }

  const statusPorcelain = safeGit(['status', '--porcelain']);
  const dirtyFiles = statusPorcelain ? statusPorcelain.split('\n').filter(Boolean) : [];
  const isDirty = dirtyFiles.length > 0;

  const upstream = safeGit(['rev-parse', '--abbrev-ref', '@{u}']);
  if (!upstream) {
    let remoteMatching = null;
    for (const r of remotes) {
      const exists = safeGit(['rev-parse', '--verify', `${r}/${currentBranch}`]);
      if (exists) {
        remoteMatching = `${r}/${currentBranch}`;
        break;
      }
    }

    const res = {
      status: remoteMatching ? 'NO_UPSTREAM_REMOTE_EXISTS' : 'NO_UPSTREAM_REMOTE_MISSING',
      currentBranch,
      remoteMatching,
      isDirty,
      dirtyFiles,
      message: remoteMatching
        ? `目前分支 ${currentBranch} 尚未設定追蹤，但遠端已存在同名分支 ${remoteMatching}。`
        : `目前分支 ${currentBranch} 尚未設定追蹤，且遠端亦無同名分支。`,
    };
    if (jsonOutput) console.log(JSON.stringify(res, null, 2));
    else console.log(res.message);
    process.exit(0);
  }

  const counts = safeGit(['rev-list', '--left-right', '--count', `HEAD...${upstream}`]);
  let ahead = 0;
  let behind = 0;
  if (counts) {
    const parts = counts.split(/\s+/).map(Number);
    ahead = parts[0] || 0;
    behind = parts[1] || 0;
  }

  let status = 'CLEAN_UP_TO_DATE';
  let message = '目前分支已是最新狀態，無需拉取。';

  if (isDirty) {
    status = 'DIRTY_WORKTREE';
    message = `工作區有 ${dirtyFiles.length} 個未提交變更，無法直接執行安全拉取。`;
  } else if (ahead > 0 && behind > 0) {
    status = 'DIVERGED';
    message = `目前分支與遠端已雙向分叉（本地領先 ${ahead} 個，落後 ${behind} 個提交）。`;
  } else if (ahead > 0 && behind === 0) {
    status = 'AHEAD_ONLY';
    message = `目前分支領先遠端 ${ahead} 個提交，無遠端新進度需要拉取。`;
  } else if (ahead === 0 && behind > 0) {
    status = 'BEHIND_CAN_FAST_FORWARD';
    message = `目前分支落後遠端 ${behind} 個提交，可進行快轉（Fast-Forward）拉取。`;
  }

  const res = {
    status,
    currentBranch,
    upstream,
    ahead,
    behind,
    isDirty,
    dirtyFiles,
    message,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log(`=== 分支拉取狀態診斷（${currentBranch}）===`);
    console.log(`- 狀態代碼：${status}`);
    console.log(`- 上游追蹤：${upstream}`);
    console.log(`- 分支進度：領先 ${ahead}，落後 ${behind}`);
    console.log(`- 工作區狀態：${isDirty ? `有未提交變更（共 ${dirtyFiles.length} 檔）` : '乾淨'}`);
    console.log(`- 診斷說明：${message}`);
  }
}

main();
