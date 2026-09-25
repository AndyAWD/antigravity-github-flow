---
name: antigravity-github-flow:agy-github-flow:github-pr
description: 專為 GitHub 拉取請求（Pull Request）設計的多語系說明自動生成技能。允許從任何非 main 分支發起到 main 主分支。建立前會主動以 ask_question 詢問使用者偏好語言（繁體中文、英文、中英雙語對照），自動分析分支變更並依標準範本產出標題與內文，支援直接透過 GitHub CLI 建立 PR。當使用者輸入 /antigravity-github-flow:agy-github-flow:github-pr 或提及「發 PR」、「建立 PR」、「產生 PR 描述」時觸發。
---

# 建立拉取請求（Pull Request）

在 GitHub Flow 模式下，從當前工作分支發起 Pull Request 到 `main` 主分支，並自動產生結構完整的說明。

## 什麼時候觸發此技能？

1. 當使用者輸入斜線指令（Slash Command）：`/antigravity-github-flow:agy-github-flow:github-pr`。
2. 當使用者提及「發 PR」、「建立 Pull Request」、「產生 PR 內容」、「發起程式碼審查」等字眼。

## 執行的實作步驟

本技能執行時，請依照下列步驟依序進行：

### 步驟 1：遠端同步與分支檢查

1. 確保遠端儲存庫存在與追蹤狀態最新：
   - 執行 `git remote` 檢查是否已設定遠端儲存庫。若尚未設定，停止流程並提示使用者：「專案尚未設定遠端儲存庫（Remote Origin），GitHub 拉取請求必須在 GitHub 遠端儲存庫上建立。請先設定遠端儲存庫並推播。」
   - 執行 `git fetch --all` 同步最新遠端節點與標籤。
2. 檢查當前工作分支：
   - 執行 `git branch --show-current`。
   - 若目前分支為 `main` 或 `master`，必須停止流程並提示使用者：「目前已在主分支上，PR 必須由工作分支發起。請先切換至欲發布的工作分支。」
3. 檢查遠端推播狀態：
   - 檢查當前分支是否已推送到遠端儲存庫。若尚未推送或本地有未推送節點，執行 `git push -u origin HEAD`。

### 步驟 2：語言偏好詢問（強制使用 ask_question）

**在產生 PR 內容之前，必須呼叫 `ask_question` 工具詢問使用者 PR 的語言**：

- **問題內容**：`請選擇本次 Pull Request（拉取請求）要使用的語言：`
- **選項清單**：
  1. `(Recommended) 繁體中文`
  2. `英文`
  3. `中英雙語對照`

等待使用者選擇後，依據所選語言決定後續 PR 標題與內文格式。若執行環境不支援 `ask_question` 或無互動介面，預設採用繁體中文模式。

### 步驟 3：分析變更與萃取核心資訊

1. 取得目標主分支與當前分支的提交紀錄：
   - 執行 `git log origin/main..HEAD --oneline`（若主分支為 `master` 則替換為 `origin/master`）。
2. 檢視變更差異（Diff）：
   - 執行 `git diff --stat origin/main..HEAD` 與關鍵修改內容。
3. 歸納分析：
   - **修改目的**：推導本次修改的背景原因、為了解決什麼核心痛點或新增了什麼功能。
   - **變更摘要**：條列具體檔案與核心邏輯修改點。
   - **變更類型判定**：自動判斷屬於 Feature、Bug Fix、Refactor、Performance、Documentation、Style、Test 或 Chore 等。
   - **受影響元件判定**：自動檢視涉及之檔案類型（`skills/`、`README`、`templates/`、`plugin.json`、`hooks/` 等）。

### 步驟 4：依據所選語言產出 PR 內容

**排版規範**：嚴格禁止在 PR 標題與內文中使用任何 Emoji 表情符號（例如 📌、🚀、🎉、📄 等），維持純文字排版的專業性與簡潔風格。

依據步驟 2 所選的語言格式產生 PR 標題與內文：

#### 模式 1：繁體中文
參考 `templates/PULL_REQUEST_TEMPLATE.md` 產出：
```markdown
## 修改目的
- [說明本次修改原因與目的]

## 變更摘要
- [條列具體調整項目]

## 變更類型
- [x] [自動打勾對應類型]

## 受影響元件
- [x] [自動打勾對應元件]

## 測試與驗證
- 測試步驟：
  1. [執行的具體測試指令]
- 驗證結果：
  - [已驗證的具體結果]

## 提交前檢查清單
- [x] 程式碼與提示詞已通過自我審查
- [x] 變更已在本地環境完成實際測試
- [x] 相關說明文件（README / 指令說明）已同步更新
- [x] 專案無多餘未追蹤檔案或臨時除錯日誌
```

#### 模式 2：英文
參考 `templates/PULL_REQUEST_TEMPLATE.en.md` 產出：
```markdown
## Purpose
- [Explain the background and motivation for this change]

## Summary of Changes
- [List specific changes]

## Type of Change
- [x] [Check appropriate box]

## Affected Components
- [x] [Check appropriate box]

## Testing & Verification
- Verification Steps:
  1. [Test steps]
- Results:
  - [Results]

## Pre-submission Checklist
- [x] Code and prompts have undergone self-review
- [x] Changes have been thoroughly tested locally
- [x] Documentation has been updated accordingly
- [x] No untracked files or leftover debug logs remain
```

#### 模式 3：中英雙語對照
參考 `templates/PULL_REQUEST_TEMPLATE.bilingual.md` 產出雙語對照章節：
```markdown
## Purpose / 修改目的

<!-- English -->
- [Explain the background and motivation for this change]

<!-- 繁體中文 -->
- [說明本次修改原因與目的]

## Summary of Changes / 變更摘要

<!-- English -->
- [List specific changes]

<!-- 繁體中文 -->
- [條列具體調整項目]

## Type of Change / 變更類型

- [x] Feature / 新功能
- [ ] Bug Fix / 錯誤修正
- [ ] Refactor / 重構
- [ ] Performance / 效能優化
- [ ] Documentation / 說明文件
- [ ] Style / 樣式調整
- [ ] Test / 測試相關
- [ ] Chore / 雜項維護

## Affected Components / 受影響元件

- [x] Skills / 技能定義
- [ ] Documentation (README / Docs) / 說明文件
- [ ] Templates / 範本檔案
- [ ] Plugin Manifests (plugin.json / package.json) / 外掛設定
- [ ] Hooks / 掛鉤腳本
- [ ] Rules / MCP / 規則與自訂

## Testing & Verification / 測試與驗證

- Verification Steps / 測試步驟：
  1. [執行的具體測試指令]
- Results / 驗證結果：
  - [已驗證的具體結果]

## Pre-submission Checklist / 提交前檢查清單

- [x] Code and prompts have undergone self-review / 程式碼與提示詞已通過自我審查
- [x] Changes have been thoroughly tested locally / 變更已在本地環境完成實際測試
- [x] Documentation has been updated accordingly / 相關說明文件已同步更新
- [x] No untracked files or leftover debug logs remain / 專案無多餘未追蹤檔案或臨時除錯日誌
```

### 步驟 5：審閱確認與發起 PR

1. 將產出的 PR 標題與內文完整呈現在對話中供使用者審核確認。
2. 檢查 GitHub 命令列介面（Command-Line Interface）（GitHub CLI，指令為 `gh`）登入狀態：
   - 執行 `gh auth status`。
3. 取得目標主分支名稱（確認遠端主分支為 `main` 或 `master`）：
   - 執行 `git symbolic-ref refs/remotes/origin/HEAD` 或檢查主分支名稱。
4. 若使用者確認無誤且 GitHub CLI 已登入，可執行指令建立正式 PR：
   ```bash
   gh pr create --title "<PR 標題>" --body "<PR 內文>" --base <目標主分支>
   ```
5. 若未安裝或未登入 GitHub CLI，輸出 Markdown 供使用者手動複製至 GitHub 網頁發起 PR。
