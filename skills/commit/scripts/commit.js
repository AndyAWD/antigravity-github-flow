#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const msg = process.argv[2];
if (!msg) {
  console.error('usage: commit.js "<full commit message>"');
  process.exit(1);
}

// 根據使用者全域規則，在 Commit 訊息末端簽署共同作者
const coAuthor = '\n\nCo-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>';
execFileSync('git', ['commit', '-m', msg + coAuthor], {
  stdio: 'inherit',
});
