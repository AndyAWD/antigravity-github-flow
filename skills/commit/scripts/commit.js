#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const msg = process.argv[2];
if (!msg) {
  console.error('usage: commit.js "<full commit message>"');
  process.exit(1);
}

// 根據使用者全域規則，在 Commit 訊息末端簽署共同作者（若無重複簽名）
const coAuthorSignature = 'Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>';
const fullMsg = msg.includes('Co-authored-by: Google Antigravity')
  ? msg
  : `${msg}\n\n${coAuthorSignature}`;

try {
  execFileSync('git', ['commit', '-m', fullMsg], {
    stdio: 'inherit',
  });
} catch (e) {
  process.exit(e.status || 1);
}
