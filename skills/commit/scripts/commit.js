#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

let rawMsg = process.argv[2];
if (!rawMsg || !rawMsg.trim()) {
  console.error('usage: commit.js "<full commit message>"');
  process.exit(1);
}

// 若訊息未包含真實換行但包含字面值 \n 或 \r\n（例如終端雙引號傳入字串），安全轉譯為真實換行符號
if (!/[\r\n]/.test(rawMsg) && /\\r\\n|\\n/.test(rawMsg)) {
  rawMsg = rawMsg.replace(/\\r\\n/g, '\r\n').replace(/\\n/g, '\n');
}

// 預設備用產生者標籤
const fallbackSignature = 'Generated-by: Google Antigravity';

// 清洗舊簽名：自動清除訊息中殘留的任何 Google Antigravity 共同作者簽名行
const cleaned = rawMsg.replace(/^[ \t]*Co-authored-by:\s*Google Antigravity[^\r\n]*(\r?\n)?/gmi, '').trimEnd();

// 使用 git interpret-trailers --parse 檢查是否已具備合規的 Generated-by Trailer
let parsedTrailers = '';
try {
  parsedTrailers = execFileSync('git', ['interpret-trailers', '--parse', '--no-divider'], {
    input: cleaned,
    encoding: 'utf8',
  });
} catch {
  parsedTrailers = '';
}

const hasGeneratedByTrailer = /^[ \t]*Generated-by:\s*\S+/mi.test(parsedTrailers);

let fullMsg;
if (hasGeneratedByTrailer) {
  try {
    // 使用 Git 原生 interpret-trailers 工具自動規範化 Git Trailer 區塊格式
    fullMsg = execFileSync('git', ['interpret-trailers', '--no-divider', '--trim-empty'], {
      input: cleaned,
      encoding: 'utf8',
    }).trim();
  } catch {
    fullMsg = cleaned;
  }
} else {
  // 若尚未具備，檢查訊息末尾是否附帶有未空行分隔的 Generated-by 行
  const endMatch = cleaned.match(/(?:^|\r?\n)[ \t]*(Generated-by:[^\r\n]*)$/i);
  let trailerToInject = fallbackSignature;
  let baseMsg = cleaned;

  if (endMatch) {
    const value = endMatch[1].replace(/^[ \t]*Generated-by:\s*/i, '').trim();
    trailerToInject = value ? endMatch[1].trim() : fallbackSignature;
    baseMsg = cleaned.slice(0, endMatch.index).trimEnd();
  }

  try {
    // 透過 git interpret-trailers --trailer 自動注入空行與規範化 Trailer
    fullMsg = execFileSync('git', ['interpret-trailers', '--no-divider', '--trim-empty', '--trailer', trailerToInject], {
      input: baseMsg,
      encoding: 'utf8',
    }).trim();
  } catch {
    fullMsg = baseMsg ? `${baseMsg}\n\n${trailerToInject}` : trailerToInject;
  }
}

try {
  execFileSync('git', ['commit', '-m', fullMsg], {
    stdio: 'inherit',
  });
} catch (e) {
  process.exit(e.status || 1);
}
