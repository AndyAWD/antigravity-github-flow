#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const msg = process.argv[2];
if (!msg) {
  console.error('usage: commit.js "<full commit message>"');
  process.exit(1);
}

// 根據官方規範，在 Commit 訊息末端強制簽署官方共同作者簽名（強制使用官方 noreply 信箱並替換任何不合規變體）
const officialSignature = 'Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>';

// 移除訊息中既有的任何 Google Antigravity 共同作者簽名行（包含各類不合規信箱與重複簽名）
const cleaned = msg.replace(/^[ \t]*Co-authored-by:\s*Google Antigravity[^\r\n]*(\r?\n)?/gmi, '').trimEnd();

let fullMsg;
try {
  // 使用 Git 原生 interpret-trailers 工具自動規範化 Git Trailer 區塊格式
  fullMsg = execFileSync('git', ['interpret-trailers', '--trailer', officialSignature], {
    input: cleaned,
    encoding: 'utf8',
  }).trimEnd();
} catch {
  fullMsg = `${cleaned}\n\n${officialSignature}`;
}

try {
  execFileSync('git', ['commit', '-m', fullMsg], {
    stdio: 'inherit',
  });
} catch (e) {
  process.exit(e.status || 1);
}
