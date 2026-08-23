#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const run = (args, options = {}) => {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      ...options,
    });
  } catch (e) {
    return e.stdout || e.stderr || `(git ${args.join(' ')} failed: ${e.message})`;
  }
};

const section = (title, out) => {
  console.log(`=== ${title} ===`);
  console.log(out.trimEnd() || '(empty)');
  console.log('');
};

// 若有設定遠端儲存庫，先在背景進行 fetch 更新狀態（加入逾時防護）
const remotes = run(['remote']).trim();
if (remotes) {
  run(['fetch', '--all', '--prune', '--tags', '--quiet'], { timeout: 10000 });
}

section('current branch', run(['symbolic-ref', '--short', 'HEAD']));
section('git status', run(['status', '--short', '--branch']));
section('staged diff (--stat)', run(['diff', '--cached', '--stat']));
section('staged full diff', run(['diff', '--cached']));
section('recent commits (last 10)', run(['log', '--oneline', '-10']));
section('branches', run(['branch', '-vv']));
