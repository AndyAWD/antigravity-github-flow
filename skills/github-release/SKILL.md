---
name: antigravity-github-flow:agy-github-flow:github-release
description: 專為 GitHub Release 設計的雙語發布說明（Release Notes）生成技能。自動比對 Git 提交歷史，依照 antigravity-cli-statusline v1.7.0 標準格式產生中英文雙語變更日誌（Changelog），並支援直接透過 GitHub CLI 建立 Release。當使用者輸入 /antigravity-github-flow:agy-github-flow:github-release 或提及「產生 Release Notes」、「建立 Release」時觸發。
---

# 建立 GitHub Release

在 GitHub 上發布新版本，並自動彙整中英文雙語發布說明（Release Notes）。

## 什麼時候觸發此技能？

1. 當使用者輸入斜線指令（Slash Command）：`/antigravity-github-flow:agy-github-flow:github-release`。
2. 當使用者提及「幫我建立 release」、「發布版本」、「產生 Release Notes」時。

## 執行的實作步驟

本技能執行時，請依照下列步驟依序進行：

### 步驟 1：確認版本號與目標標籤

1. 檢查分支與目標標籤：
   - 執行 `git branch --show-current` 確認當前分支（通常在 `main` 或 `master` 主分支發布）。
   - 讀取 `package.json` 或 `plugin.json` 中的 `version` 欄位。
   - 執行 `git describe --tags --abbrev=0` 查詢上一個 Git 標籤（Tag）。若指令回傳錯誤（例如 `fatal: No names found`），代表儲存庫尚無任何標籤，本次為初始版本發布。
2. 若使用者未明確指定發布版本號，呼叫 `ask_question` 工具向使用者確認預計發布的版本號（例如 `v1.0.0`）；若環境無互動介面則以專案設定檔之版本號為主。

### 步驟 2：擷取與分類 Git 提交歷史

1. 確保遠端狀態同步：
   - 若專案設定有遠端儲存庫（`git remote`），先執行 `git fetch --all --tags` 確保取得全域最新標籤與節點。
2. 取得遠端儲存庫名稱：
   - 執行 `git remote get-url origin` 解析 GitHub 儲存庫路徑 `<owner>/<repo>`（支援 HTTPS 與 SSH 格式）。若無遠端，退回預設佔位符號。
3. 擷取 Commit 紀錄：
   - 若存在上一個標籤：執行 `git log <上一個Tag>..HEAD --oneline`。
   - 若尚無任何標籤（初始版本）：執行 `git log HEAD --oneline` 取得專案全域提交歷史。
4. 依據慣例式提交（Conventional Commits）規範分析變更並歸類：
   - `feat:` -> 英文：`**Feat:**` / 繁體中文：`**新功能:**`
   - `fix:` -> 英文：`**Fix:**` / 繁體中文：`**修正:**`
   - `refactor:` -> 英文：`**Refactor:**` / 繁體中文：`**重構:**`
   - `perf:` -> 英文：`**Perf:**` / 繁體中文：`**效能:**`
   - `style:` -> 英文：`**Style:**` / 繁體中文：`**樣式:**`
   - `test:` -> 英文：`**Test:**` / 繁體中文：`**測試:**`
   - `docs:` -> 英文：`**Docs:**` / 繁體中文：`**文件:**`
   - `chore:` -> 英文：`**Chore:**` / 繁體中文：`**雜項:**`
   - 僅列出本次發布實際包含之變更類別，無變更之類別毋須列出。
5. 獲取 Commit 作者的 GitHub 帳號名稱（例如 `@AndyAWD`），若無法確認則以 Commit 作者名稱標記。

### 步驟 3：產出雙語發布說明內容

**排版規範**：嚴格禁止在發布說明中使用任何 Emoji 表情符號，保持純文字排版的專業性與簡潔風格。

依據 `templates/RELEASE.template.md` 規範產出 Markdown 內容：

```markdown
### What's Changed

#### English

- **Feat:** [英文描述] by @[GitHub 帳號]
- **Fix:** [英文描述] by @[GitHub 帳號]

#### 繁體中文

- **新功能:** [繁體中文描述] by @[GitHub 帳號]
- **修正:** [繁體中文描述] by @[GitHub 帳號]

<!-- 若有上一個標籤，使用 compare 連結： -->
**Full Changelog**: https://github.com/<owner>/<repo>/compare/<上一個Tag>...<本次版本號>

<!-- 若為初始發布（尚無舊標籤），使用 commits 連結： -->
**Full Changelog**: https://github.com/<owner>/<repo>/commits/<本次版本號>
```

### 步驟 4：發布確認與 GitHub CLI 整合

1. 先將整理好的雙語發布說明呈現在對話中供使用者審閱。
2. 檢查 GitHub 命令列介面（Command-Line Interface）（GitHub CLI，指令為 `gh`）登入狀態：
   - 執行 `gh auth status`。
3. 若使用者確認內容無誤且 GitHub CLI 已登入，可協助執行指令建立正式 Release：
   ```bash
   gh release create <版本號> --title "<版本號>" --notes "<發布說明內容>"
   ```
4. 若未安裝或未登入 GitHub CLI，提供產出的 Markdown 文本供使用者手動複製至 GitHub 網頁發布。
