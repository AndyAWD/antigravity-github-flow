# antigravity-github-flow

[English](README.md) | 繁體中文

一個專為 Google Antigravity（AGY）設計的外掛程式（Plugin），提供極簡、敏捷且符合 GitHub 工作流程（GitHub Flow）標準的自動化工作管線。

全面支援 Google Antigravity 的三大核心平台：Antigravity 命令列介面（Command-Line Interface）（`agy`）、Antigravity 整合開發環境（Integrated Development Environment）以及 Antigravity 2.0 桌面應用程式。

本外掛程式依據慣例式提交（Conventional Commits）v1.0.0 規範自動產生精確的 Git 提交（Commit），並以單一 `main` 主分支為核心，串聯分支建立、拉取請求（Pull Request）發布、中英雙語發布說明（Release Notes）與雙語說明文件生成等完整生命週期。

## 如何安裝

透過 Antigravity 命令列介面進行全域安裝：

```bash
agy plugin install https://github.com/AndyAWD/antigravity-github-flow
```

## 特色亮點

1. **全平台無縫相容**：完美相容於命令列介面終端機、整合開發環境側邊欄對話方塊以及 2.0 桌面版的對話畫布（Chat Canvas）。
2. **自動導航與流程推進**：專為不熟悉 Git 的開發者設計，人工智慧（Artificial Intelligence）自動分析目前專案狀態，主動引導並推進至下一個合理的 GitHub Flow 步驟。
3. **慣例式提交規範與自動拆分**：嚴格遵循慣例式提交規範，自動將工作區變更拆分為獨立邏輯群組分次提交，並在提交結尾自動標註 Google Antigravity 共同作者簽名。
4. **敏捷單一主幹工作模型**：以 `main` 主分支為核心，功能與修復分支皆從 `main` 切出，完成後透過拉取請求或本地安全合併。
5. **標準化雙語文件與版本發布**：提供多語系拉取請求範本、中英雙語 GitHub Release 發布說明，以及雙語說明文件智慧同步機制。
6. **全域狀態安全同步**：內建非當前分支多軌本地快轉與診斷決策樹，兼具自動化效率與工作區安全保護。

## 如何管理與切換外掛程式

• 列出已安裝外掛：

  ```bash
  agy plugin list
  ```

• 啟用外掛：

  ```bash
  agy plugin enable antigravity-github-flow
  ```

• 停用外掛：

  ```bash
  agy plugin disable antigravity-github-flow
  ```

• 移除外掛：

  ```bash
  agy plugin uninstall antigravity-github-flow
  ```

> 在 Antigravity 2.0 左側欄的 **Skills & Customizations** 面板中，亦可即時檢視外掛載入狀態。

## 專案資料夾目錄

```text
antigravity-github-flow/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── plugin.json
├── package.json
├── LICENSE
├── README.md
├── README.zh-TW.md
├── templates/
│   ├── README.template.md
│   ├── README.zh-TW.template.md
│   ├── RELEASE.template.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── PULL_REQUEST_TEMPLATE.en.md
│   └── PULL_REQUEST_TEMPLATE.bilingual.md
└── skills/
    ├── auto-next/
    ├── commit/
    ├── fetch/
    ├── github-pr/
    ├── github-release/
    ├── init/
    ├── merge/
    ├── pull/
    ├── push/
    ├── release/
    ├── sync-readme/
    └── tag/
```

## 指令功能說明

安裝完成後，可在任何 AGY 介面透過語意對話或輸入對應的斜線指令（Slash Command）觸發：

### 1. 智慧導航（Auto Next）

```text
/antigravity-github-flow:agy-github-flow:auto-next
```

- **使用情境**：不確定下一步該做什麼，或希望由人工智慧自動推進 GitHub Flow 開發流程時。
- **運作流程**：
  1. 背景執行遠端狀態擷取（Fetch）並安全快轉非當前本地分支。
  2. 檢查專案是否已建立版本控制與 `main` 主分支。
  3. 檢查工作區變更並自動進行提交（Commit）與遠端推播（Push）。
  4. 依工作分支狀態自動推進發布拉取請求、分支合併或建立發布分支。

### 2. 慣例式提交（Commit）

```text
/antigravity-github-flow:agy-github-flow:commit
```

- **使用情境**：開發告一段落，準備將工作區變更寫入版本歷史時。
- **運作流程**：
  1. 檢查工作區變更並執行安全防呆檢查。
  2. 若包含多項獨立任務，自動拆分為多個邏輯群組分次提交。
  3. 若在 `main` 主分支，主動引導切出工作分支或直接提交。
  4. 依據規範產生繁體中文描述並附上 Google Antigravity 共同作者簽名。

### 3. 分支合併（Merge）

```text
/antigravity-github-flow:agy-github-flow:merge
```

- **使用情境**：功能或修復開發完成，準備整併回 `main` 主分支時。
- **運作流程**：
  1. 詢問使用者偏好發起 GitHub 拉取請求或於本地直接合併。
  2. 本地合併自動切換至 `main`、同步遠端進度後執行 `--no-ff` 合併。
  3. 合併完成後詢問是否刪除原始工作分支。

### 4. 發布拉取請求（GitHub PR）

```text
/antigravity-github-flow:agy-github-flow:github-pr
```

- **使用情境**：準備從工作分支向 `main` 主分支發起程式碼審查時。
- **運作流程**：
  1. 檢查分支狀態，確認不在 `main` 主分支且已同步推播至遠端。
  2. 透過互動對話方塊詢問拉取請求偏好語言（繁體中文、英文、中英雙語對照）。
  3. 分析提交差異，自動萃取修改目的、變更摘要、變更類型與受影響元件，產出純文字無表情符號的結構化說明。
  4. 審查確認後透過 GitHub CLI（`gh pr create`）發布至 GitHub。

### 5. 遠端推播（Push）

```text
/antigravity-github-flow:agy-github-flow:push
```

- **使用情境**：將本地端變更與標籤同步上傳至遠端儲存庫時。
- **運作流程**：
  1. 推播前先執行遠端狀態擷取，檢查遠端狀態。
  2. 確認本地未落後遠端後，執行 `git push -u origin HEAD --follow-tags`。

### 6. 遠端狀態擷取（Fetch）

```text
/antigravity-github-flow:agy-github-flow:fetch
```

- **使用情境**：擷取遠端最新變更與標籤，並在本地多軌快轉更新所有非當前分支時。
- **運作流程**：
  1. 執行 `git fetch --all --prune --tags` 下載全域最新物件。
  2. 掃描所有本地分支，針對非當前分支在背景進行本地安全快轉更新。
  3. 若遇分叉或衝突則安全略過，維持當前工作區完整性。

### 7. 遠端拉取（Pull）

```text
/antigravity-github-flow:agy-github-flow:pull
```

- **使用情境**：整合遠端最新進度至當前工作分支時。
- **運作流程**：
  1. 強制自動先執行遠端狀態擷取，確保全域資料與非當前分支為最新狀態。
  2. 針對當前分支進行安全快轉拉取（`git pull --ff-only`）。
  3. 若因工作區變更、分叉或衝突無法直接拉取，啟動互動選單提供排解建議。

### 8. 建立發布準備分支（Release）

```text
/antigravity-github-flow:agy-github-flow:release
```

- **使用情境**：準備發布新版本並更新專案版號時。
- **運作流程**：
  1. 分析提交紀錄推算語意化版本（Semantic Versioning）。
  2. 從 `main` 切出 `release/<版號>` 分支。
  3. 自動更新 `package.json`、`build.gradle`、`pyproject.toml` 等檔案中的版本號並建立提交。
- **參數與範例**（選用）：
```text
/antigravity-github-flow:agy-github-flow:release [vX.Y.Z]
```

### 9. 自動版號標記（Tag）

```text
/antigravity-github-flow:agy-github-flow:tag
```

- **使用情境**：在 `main` 主分支完成合併後，為節點標記正式版本標籤時。
- **運作流程**：
  1. 限制必須在 `main` 或 `master` 主分支執行。
  2. 依據語意化版本規範分析合併節點並計算版號。
  3. 建立 `vX.Y.Z` 標籤並引導推播至遠端。
- **參數與範例**（選用）：
```text
/antigravity-github-flow:agy-github-flow:tag [vX.Y.Z]
```

### 10. 建立 GitHub 發布（GitHub Release）

```text
/antigravity-github-flow:agy-github-flow:github-release
```

- **使用情境**：在 GitHub 儲存庫上建立正式發布說明時。
- **運作流程**：
  1. 確認版本號與上一個標籤之間的提交歷史。
  2. 依據慣例式提交分類，產生中英文雙語變更日誌（無表情符號）與比對連結。
  3. 審查確認後透過 GitHub CLI（`gh release create`）正式發布。

### 11. 專案初始化（Init）

```text
/antigravity-github-flow:agy-github-flow:init
```

- **使用情境**：全新專案一鍵搭建 GitHub Flow 單一主分支基礎架構時。
- **運作流程**：
  1. 檢查或執行 `git init`。
  2. 建立初始提交。
  3. 確保主分支名稱為 `main` 並停留在 `main` 準備開始工作。

### 12. 說明文件智慧同步（Sync Readme）

```text
/antigravity-github-flow:agy-github-flow:sync-readme
```

- **使用情境**：全新建立、增量更新或結構重構專案的雙語說明文件時。
- **運作流程**：
  1. 解析專案設定檔、遠端儲存庫與 `skills/` 目錄。
  2. 自動判定執行模式（全新建立、增量更新或結構重構）。
  3. 依標準規格同步產生對稱的 `README.md`（英文）與 `README.zh-TW.md`（繁體中文）。

## 授權條款

本專案採用 MIT 授權條款釋出，詳情請參閱 [LICENSE](LICENSE) 檔案。
