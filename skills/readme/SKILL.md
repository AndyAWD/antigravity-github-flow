---
name: antigravity-github-flow:agy-github-flow:readme
description: 專為 Google Antigravity（AGY）外掛程式設計的雙語說明文件自動產生技能。自動分析當前工作區的 plugin.json、skills/ 等檔案，依據標準規格產出或更新 README.md（英文）與 README.zh-TW.md（繁體中文）。當使用者提及「產生外掛文件」、「更新 README」、「生成雙語文件」或輸入 /antigravity-github-flow:agy-github-flow:readme 時觸發。
---

# 雙語說明文件生成器（readme）

本技能專門為 Google Antigravity 外掛程式（Plugin）建立標準化、結構嚴謹且易於維護的雙語說明文件（README）。

## 觸發時機

當符合以下任一條件時觸發本技能：
1. 使用者輸入斜線指令（Slash Command）：`/antigravity-github-flow:agy-github-flow:readme`。
2. 使用者提及「產生外掛文件」、「更新 README」、「生成雙語文件」等字眼。

## 執行流程

本技能執行時，請依照下列步驟依序進行：

### 步驟 1：探索與分析工作區結構

1. 檢查工作區根目錄是否存在 `plugin.json` 與 `package.json`：
   - 讀取外掛名稱（`name`）、版本（`version`）與簡介（`description`）。
2. 獲取遠端 Git 儲存庫（Repository）網址：
   - 執行 `git remote get-url origin` 取得 GitHub 儲存庫網址。若無遠端或尚未設定，使用預設格式 `https://github.com/<username>/<plugin-name>`。
3. 掃描 `skills/` 目錄：
   - 讀取各子目錄中的 `SKILL.md`，解析 YAML Frontmatter 中的 `name` 與 `description`。
   - 分析內文，提取該技能的觸發情境、核心執行步驟與參數說明。
4. 掃描其他自訂擴充元件（若有）：
   - 檢查是否存在 `hooks/`、`mcp/`、`rules/`、`templates/` 等資料夾。

### 步驟 2：確認並規劃章節架構

產出的兩份文件必須維持對稱一致的章節順序：

1. **第一行標題**：全形/半形必須嚴格為 `# <專案名稱>`。
2. **語言導覽切換**：
   - 英文版（`README.md`）：`English | [繁體中文](README.zh-TW.md)`
   - 繁體中文版（`README.zh-TW.md`）：`[English](README.md) | 繁體中文`
3. **專案簡介**：精準概述外掛的核心價值，並註明支援 Antigravity 三大平台：Antigravity 命令列介面（Command-Line Interface）（`agy`）、Antigravity 整合開發環境（Integrated Development Environment）以及 Antigravity 2.0 桌面應用程式。
4. **如何安裝**：
   - 採純 CLI 指令形式。
   - 使用獨立程式碼區塊（Code Block）呈現安裝指令：
     ```bash
     agy plugin install https://github.com/<owner>/<repo>
     ```
5. **特色亮點**：條列 4 至 6 項核心優勢。
6. **如何管理與切換外掛程式**：
   - **關鍵規則：每一行指令都必須使用縮排的獨立單行程式碼區塊（搭配清單圓點 • ）**，讓使用者在 GitHub 介面能直觀瀏覽並單擊複製按鈕獨立複製該行：
     ```markdown
       • 列出已安裝外掛：
         ```bash
         agy plugin list
         ```

       • 啟用外掛：
         ```bash
         agy plugin enable <plugin-name>
         ```

       • 停用外掛：
         ```bash
         agy plugin disable <plugin-name>
         ```

       • 移除外掛：
         ```bash
         agy plugin uninstall <plugin-name>
         ```
     ```
7. **專案資料夾目錄**：使用乾淨直觀的 ASCII 樹狀圖呈現結構，不附加冗餘的項目解說清單，維持版面精簡俐落。
8. **指令功能說明**：
   - 針對每個技能條列說明，結構包含：
     - 獨立單行指令區塊（便於一鍵複製，例如 `/<plugin-name>:<skill-path>`）
     - 使用情境（When to Use / 使用情境）
     - 運作流程（How It Works / 運作流程）
     - 參數範例（若有可選參數）
9. **授權條款**：標示 MIT 等授權資訊。

### 步驟 3：撰寫與更新雙語檔案

1. 參考 `templates/README.template.md` 產生根目錄的英文版讀我檔案（`README.md`）。若工作區無此範本檔，直接依照步驟 2 定義之 9 大標準章節架構生成。
2. 參考 `templates/README.zh-TW.template.md` 產生根目錄的繁體中文版讀我檔案（`README.zh-TW.md`）。若工作區無此範本檔，直接依照步驟 2 定義之 9 大標準章節架構生成。
3. 繁體中文規範檢驗：
   - 採用台灣慣用詞彙（軟體、程式、資料、檔案、網路、伺服器、函式、參數、元件、設定、執行、建置）。
   - 專有名詞首次出現且有通行譯名時，強制採用「中文譯名（英文原文）」格式，英文不使用縮寫，後續只寫中文譯名。
   - 程度詞附具體數值或基準，刪除無訊息量的填充詞。

### 步驟 4：總結報告

向使用者回報已產生的檔案清單與內容摘要。
