# antigravity-github-flow

一個專為 Google Antigravity（AGY）設計的外掛程式（Plugin），提供極簡、敏捷且符合 GitHub Flow 標準的自動化工作流程。

全面支援 Antigravity 的三大核心平台：Antigravity 命令列介面（CLI）（agy）、Antigravity 整合開發環境（IDE）以及 Antigravity 2.0 桌面應用程式。

本外掛程式依據慣例式提交（Conventional Commits）v1.0.0 繁體中文規範自動產生精準的 Git Commit，並以單一 main 主分支為核心，串聯分支建立、拉取請求（Pull Request / PR）發布、版本標記與遠端推播等完整生命週期。

## 什麼是 antigravity-github-flow 的特色？

1. 全平台無縫支援：相容於 CLI 終端機、IDE 側邊欄對話框以及 2.0 桌面版的對話畫布（Chat Canvas）。
2. 自動模式與智慧導航：專為不熟悉 Git 的開發者設計，AI 自動分析目前專案狀態，主動引導並推進到下一個合理的 GitHub Flow 步驟。
3. 嚴格遵循慣例式提交規範：內建繁體中文提示詞，確保 `<type>[scope]: <描述>` 格式統一，避免 AI 產生幻覺。
4. 多任務自動拆分：自動分析工作區中的多個不同修改，並聰明地拆分為多個獨立的 Commit。
5. 極簡單一主幹模型：以 main 分支為核心，任何新功能、修復或發布皆從 main 切出分支，完成後透過 PR 或本地合併回 main，乾淨俐落。
6. Antigravity 專屬共同作者簽名：所有自動建立的 Commit 末端皆會加上 Google Antigravity 共同作者簽名，清楚保留 AI 協作足跡。

## 如何安裝與啟用？

本外掛程式支援全域安裝（所有專案共用）與專案工作區安裝（團隊共用）：

### 方式一：全域安裝（推薦）

全域安裝後，Antigravity CLI、Antigravity 2.0 與 Antigravity IDE 均能自動辨識並載入本外掛程式的所有技能（Skills）。

1. 透過命令列介面（CLI）安裝：
   ```bash
   agy plugin install https://github.com/AndyAWD/antigravity-github-flow
   ```

2. 透過 Git 手動複製到全域目錄：
   - Linux / macOS：
     ```bash
     git clone https://github.com/AndyAWD/antigravity-github-flow.git ~/.gemini/config/plugins/antigravity-github-flow
     ```
   - Windows（PowerShell）：
     ```powershell
     git clone https://github.com/AndyAWD/antigravity-github-flow.git "$HOME\.gemini\config\plugins\antigravity-github-flow"
     ```

### 方式二：專案工作區安裝（Workspace / 團隊共用）

若希望將本外掛程式限定於單一專案：

1. 目錄結構放置：
   將本外掛程式資料夾放置於專案根目錄的 `.agents/plugins/antigravity-github-flow/`：
   ```text
   <專案根目錄>/
   └── .agents/
       └── plugins/
           └── antigravity-github-flow/
               ├── plugin.json
               └── skills/
   ```

2. 透過 plugins.json 註冊（選用）：
   在專案的 `.agents/plugins.json` 中宣告路徑：
   ```json
   {
     "entries": [
       { "path": "path/to/antigravity-github-flow" }
     ]
   }
   ```

### 如何管理與切換外掛程式？

您可透過 Antigravity CLI 指令管理狀態：

1. 列出已安裝外掛：`agy plugin list`
2. 啟用外掛：`agy plugin enable antigravity-github-flow`
3. 停用外掛：`agy plugin disable antigravity-github-flow`
4. 移除外掛：`agy plugin uninstall antigravity-github-flow`
5. 在 Antigravity 2.0 左側欄的 Skills & Customizations 面板中，可即時檢視載入狀態。

## 有哪些核心技能與指令？

安裝完成後，可以在任何 AGY 介面透過語意對話或輸入對應的斜線指令（Slash Commands）觸發：

### 1. 智慧導航（Auto Next）
```text
/antigravity-github-flow:auto-next
```
- 情境：不知下一步該做什麼，或想讓 AI 自動推進工作流程。
- 運作邏輯：自動檢查工作區是否有未儲存檔案、是否落後遠端、目前分支狀態，並自動依序執行提交、同步、發布 PR 或打 Tag。

### 2. 慣例式提交（Commit）
```text
/antigravity-github-flow:commit
```
- 情境：開發告一段落，準備將變更寫入版本歷史。
- 運作邏輯：
  1. 檢查未追蹤檔案並進行安全確認。
  2. 分析變更並自動拆分獨立任務。
  3. 若在 main 主分支，會主動詢問要切出新分支還是直接提交到 main。
  4. 依據規範產生繁體中文描述並附上共同作者簽名。

### 3. 分支合併（Merge）
```text
/antigravity-github-flow:merge
```
- 情境：功能或修復開發完成，準備整併回 main 主分支。
- 運作邏輯：
  1. 詢問使用者偏好發起 GitHub Pull Request 或在本地直接合併。
  2. 本地合併自動切換至 main、同步最新遠端進度後執行 `--no-ff` 合併。
  3. 合併完成後主動詢問是否刪除原始分支以保持儲存庫整潔。

### 4. 發布拉取請求（GitHub PR）
```text
/antigravity-github-flow:github-pr
```
- 情境：準備發起代碼審查（Code Review）並將變更合併至 main。
- 運作邏輯：
  1. 自動檢查工作分支並確保遠端進度最新。
  2. 自動總結近期 Commit 紀錄並以繁體中文撰寫標題與內容。
  3. 透過 `gh pr create` 自動在 GitHub 上建立 PR。

### 5. 遠端推播（Push）
```text
/antigravity-github-flow:push
```
- 情境：將本地端變更與標籤同步上傳至遠端儲存庫。
- 運作邏輯：
  1. 推送前先 fetch 檢查遠端狀態。
  2. 若落後則提醒同步；若無落後則執行 `git push -u origin HEAD --follow-tags`。

### 6. 建立發布準備分支（Release）
```text
/antigravity-github-flow:release [vX.Y.Z]
```
- 情境：準備發布新版本並更新專案版號。
- 運作邏輯：
  1. 分析提交紀錄推算語意化版本號（SemVer）。
  2. 從 main 切出 `release/<版號>` 分支。
  3. 跨平台智慧搜尋並更新 `package.json`、`build.gradle`、`pyproject.toml` 等檔案中的版號。
  4. 自動建立版號更新提交。

### 7. 自動版號標記（Tag）
```text
/antigravity-github-flow:tag [vX.Y.Z]
```
- 情境：在 main 主分支完成合併後，為節點打上正式版本標籤。
- 運作邏輯：
  1. 嚴格限制在 main 或 master 主分支執行。
  2. 依據 SemVer 規範分析合併節點並加算版號。
  3. 打上 `vX.Y.Z` 標籤並引導推播至遠端。

### 8. 建立 GitHub Release
```text
/antigravity-github-flow:github-release
```
- 情境：在 GitHub 儲存庫上建立正式發布說明與 Release。
- 運作邏輯：
  1. 自動擷取上一個 Tag 到目前節點的 Commit 紀錄。
  2. 自動產生中英文雙語的發布變更清單（Changelog）。
  3. 透過 `gh release create` 自動發布至 GitHub。

### 9. 專案初始化（Init）
```text
/antigravity-github-flow:init
```
- 情境：全新專案一鍵搭建 GitHub Flow 單一主分支基礎架構。
- 運作邏輯：
  1. 檢查或執行 `git init`。
  2. 建立初始提交。
  3. 確保主分支名稱為 `main` 並停留在 `main` 準備開始工作。
