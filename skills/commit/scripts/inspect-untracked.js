#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { extname, basename, resolve } from 'node:path';
import { statSync, lstatSync, existsSync, openSync, readSync, closeSync, readFileSync } from 'node:fs';

const run = (args, cwd = process.cwd()) => {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      cwd,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
  } catch (e) {
    return '';
  }
};

// 取得 Git 儲存庫根目錄
const getRepoRoot = () => {
  const root = run(['rev-parse', '--show-toplevel']).trim();
  return root || process.cwd();
};

const repoRoot = getRepoRoot();

// 透過 -C repoRoot 確保全儲存庫檢視，並以 -c core.quotePath=false 與 -z 確保不轉義非 ASCII 檔名且正確以 \0 切割
let rawOutput = '';
try {
  rawOutput = execFileSync('git', ['-C', repoRoot, '-c', 'core.quotePath=false', 'ls-files', '-z', '--others', '--exclude-standard'], {
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
} catch {
  rawOutput = '';
}

const files = rawOutput.split('\0').map((f) => f.trim()).filter(Boolean);

if (files.length === 0) {
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ repoRoot, total: 0, groups: [] }, null, 2));
  } else {
    console.log('未發現任何未追蹤的檔案（No untracked files found）。');
  }
  process.exit(0);
}

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.tiff', '.psd',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.tar', '.gz', '.tgz', '.bz2', '.xz', '.7z', '.rar',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.wasm', '.class', '.jar', '.war',
  '.mp3', '.mp4', '.wav', '.ogg', '.flac', '.avi', '.mov', '.wmv', '.mkv', '.webm',
  '.iso', '.dmg', '.pkg', '.deb', '.rpm', '.apk', '.aab',
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  '.sqlite', '.db', '.pyc', '.pyo', '.pyd'
]);

const isBinaryFile = (fullPath, ext) => {
  if (BINARY_EXTENSIONS.has(ext)) return true;
  try {
    const fd = openSync(fullPath, 'r');
    const buf = Buffer.alloc(8000);
    const bytesRead = readSync(fd, buf, 0, 8000, 0);
    closeSync(fd);
    for (let i = 0; i < bytesRead; i++) {
      if (buf[i] === 0) return true;
    }
  } catch {
    // 若無法讀取則不假定為二進位
  }
  return false;
};

const categorize = (filePath) => {
  const base = basename(filePath).toLowerCase();
  const ext = extname(filePath).toLowerCase();

  // 測試檔案
  if (
    base.includes('.test.') ||
    base.includes('.spec.') ||
    base.startsWith('test_') ||
    filePath.includes('/__tests__/') ||
    filePath.startsWith('test/') ||
    filePath.startsWith('tests/')
  ) {
    return { id: 'test', name: '測試檔案群組（Tests）' };
  }

  // 設定與組態（含無副檔名之常見組態檔及點開頭組態檔）
  const configFiles = [
    'dockerfile', 'containerfile', 'makefile', 'procfile', 'gemfile', 'vagrantfile',
    'cmakelists.txt', '.gitignore', '.gitattributes', '.editorconfig', '.npmrc',
    '.nvmrc', '.yarnrc', '.prettierrc', '.prettierignore', '.eslintrc', '.eslintignore',
    '.babelrc', '.dockerignore'
  ];
  if (
    configFiles.includes(base) ||
    base.startsWith('.env') ||
    base.startsWith('.prettierrc') ||
    base.startsWith('.eslintrc') ||
    ['.json', '.yaml', '.yml', '.toml', '.ini', '.xml', '.env', '.conf', '.config'].includes(ext)
  ) {
    // 檢查是否為建置相依檔
    const buildFiles = [
      'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
      'cargo.toml', 'cargo.lock', 'go.mod', 'go.sum', 'pom.xml',
      'requirements.txt', 'gemfile.lock', 'composer.json'
    ];
    if (buildFiles.includes(base) || base.startsWith('build.gradle') || base.startsWith('settings.gradle')) {
      return { id: 'build', name: '建置與相依性群組（Build & Dependencies）' };
    }
    return { id: 'config', name: '設定與組態群組（Configuration）' };
  }

  // 說明文件（含 LICENSE 等無副檔名文件）
  const docFiles = ['license', 'licence', 'copying', 'readme', 'changelog', 'contributing', 'authors', 'notice'];
  if (docFiles.includes(base) || ['.md', '.txt', '.rst', '.adoc'].includes(ext)) {
    return { id: 'docs', name: '說明文件群組（Documentation）' };
  }

  // 程式原始碼
  if (
    ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.go', '.java', '.kt', '.kts',
     '.c', '.cpp', '.h', '.hpp', '.rs', '.rb', '.php', '.sh', '.bash', '.zsh',
     '.swift', '.scala', '.r', '.dart', '.lua', '.sql'].includes(ext)
  ) {
    return { id: 'source', name: '程式原始碼群組（Source Code）' };
  }

  // 樣式與標記
  if (['.css', '.scss', '.sass', '.less', '.html', '.htm', '.vue', '.svelte'].includes(ext)) {
    return { id: 'style', name: '樣式與標記群組（Styles & Markup）' };
  }

  // 暫存與記錄檔
  if (
    ['.log', '.tmp', '.temp', '.bak', '.swp', '.swo', '.cache'].includes(ext) ||
    base.endsWith('~') ||
    base.startsWith('.#')
  ) {
    return { id: 'temp', name: '暫存與記錄檔群組（Logs & Temporary）' };
  }

  // 靜態資源與多媒體
  if (
    ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.tiff', '.bmp',
     '.mp4', '.mp3', '.wav', '.ttf', '.otf', '.woff', '.woff2'].includes(ext)
  ) {
    return { id: 'assets', name: '靜態資源與多媒體群組（Assets & Media）' };
  }

  return { id: 'others', name: `其他檔案群組（${ext || base}）` };
};

const getFileInfo = (relPath) => {
  const fullPath = resolve(repoRoot, relPath);
  const ext = extname(relPath).toLowerCase();
  let size = 0;
  let lines = 0;
  let preview = '';
  let isBinary = false;
  let isSymlink = false;

  try {
    if (existsSync(fullPath)) {
      const lstat = lstatSync(fullPath);
      isSymlink = lstat.isSymbolicLink();
      const stat = statSync(fullPath);
      size = stat.size;

      if (isSymlink) {
        preview = '(符號連結)';
      } else if (isBinaryFile(fullPath, ext)) {
        isBinary = true;
        preview = '(二進位檔案，無文字預覽)';
      } else if (size >= 1024 * 1024) {
        preview = '(檔案大於 1MB，略過內容預覽)';
      } else {
        const content = readFileSync(fullPath, 'utf8');
        const contentLines = content.split(/\r?\n/);
        lines = contentLines.length;
        const nonBlank = contentLines
          .map((l) => l.trim())
          .find((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('/*'))
          || contentLines[0]?.trim()
          || '';
        preview = nonBlank.slice(0, 80);
      }
    } else {
      // 檢查是否為失效的符號連結
      try {
        const lstat = lstatSync(fullPath);
        if (lstat.isSymbolicLink()) {
          isSymlink = true;
          size = lstat.size;
          preview = '(失效的符號連結)';
        }
      } catch {
        preview = '(檔案不存在或已被移除)';
      }
    }
  } catch {
    preview = '(無法讀取預覽)';
  }

  return {
    path: relPath,
    fullPath,
    size,
    lines,
    isBinary,
    isSymlink,
    preview,
  };
};

const groupMap = new Map();
for (const file of files) {
  const cat = categorize(file);
  if (!groupMap.has(cat.id)) {
    groupMap.set(cat.id, { id: cat.id, name: cat.name, files: [] });
  }
  groupMap.get(cat.id).files.push(getFileInfo(file));
}

const groups = Array.from(groupMap.values());

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ repoRoot, total: files.length, groups }, null, 2));
} else {
  console.log(`=== 偵測到 ${files.length} 個未追蹤檔案 ===\n`);
  for (const g of groups) {
    console.log(`📁 ${g.name}（${g.files.length} 個檔案）：`);
    for (const f of g.files) {
      const lineStr = (!f.isBinary && !f.isSymlink && f.lines > 0) ? `, ${f.lines} 行` : '';
      const prevStr = f.preview ? ` - 摘要: ${f.preview}` : '';
      console.log(`  - ${f.path} (${f.size} 位元組${lineStr})${prevStr}`);
    }
    console.log('');
  }
}
