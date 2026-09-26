---
name: antigravity-github-flow:agy-github-flow:sync-readme
description: 專為 Google Antigravity 外掛程式設計的說明文件智慧同步技能。自動比對專案結構，依據標準規範智慧分流執行「全新建立」、「增量更新」或「結構重構」雙語說明文件（README.md 與 README.zh-TW.md）。當使用者輸入 /antigravity-github-flow:agy-github-flow:sync-readme 或提及「同步說明文件」、「同步 README」、「建立 README」、「重構 README」時觸發。
---

# 說明文件智慧同步（sync-readme）

本技能專門為 Google Antigravity 外掛程式（Plugin）提供生命週期完整覆蓋的說明文件（README）智慧同步機制。具備自動分析工作區狀態能力，智慧分流執行「全新建立」、「增量更新」或「結構重構」。

## 觸發時機

當符合以下任一條件時觸發本技能：
1. 使用者輸入斜線指令（Slash Command）：`/antigravity-github-flow:agy-github-flow:sync-readme` 或 `/sync-readme`。
2. 使用者提及「同步說明文件」、「同步 README」、「建立 README」、「重構 README」、「維護說明文件」等字眼。

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
5. 檢查現有說明文件狀態：
   - 確認根目錄是否存在 `README.md` 與 `README.zh-TW.md`。

### 步驟 2：智慧判定執行模式（三態自動分流）

依據步驟 1 取得的現況資訊與使用者提示詞，自動判定並切換至對應執行模式：

- **模式一：全新建立（Create Mode）**
  - **觸發條件**：專案根目錄不存在 `README.md` 或 `README.zh-TW.md`，或是使用者明確指示「建立 README」。
  - **執行原則**：直接以步驟 3 之 9 大標準章節架構，為專案從零搭建完整且對稱的雙語說明文件。

- **模式二：增量更新（Update Mode）**
  - **觸發條件**：專案已具備標準 9 大章節之說明文件，且使用者未指示重構。
  - **執行原則**：嚴格保留既有的專案精神、簡介、特色亮點與客製化段落；僅比對並更新「專案資料夾目錄（ASCII 樹狀圖）」與「指令功能說明（Commands and Skills）」中新增、刪除或修改之技能，並同步版本號。

- **模式三：結構重構（Refactor Mode）**
  - **觸發條件**：現有說明文件存在，但格式非標準（如章節順序偏移、缺少雙語切換、排版混亂、缺少一鍵複製獨立指令區塊），或使用者明確提示「重構說明文件」。
  - **執行原則**：完整讀取現有內容中之有效描述與技術資訊，重新映射排版至 9 大標準章節中，補齊對稱之繁體中文版或英文版，消除格式違規，達成規範對齊。

### 步驟 3：確認並規劃章節架構

產出的兩份文件必須維持對稱一致的 9 大標準章節順序：

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
   - **關鍵規則：每一行指令都必須使用縮排的獨立單行程式碼區塊（搭配清單圓點 • ），且圓點標題與程式碼區塊之間必須加入空行以確保換行渲染與獨立複製**，讓使用者在 GitHub 介面能直觀瀏覽並單擊複製按鈕獨立複製該行：
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

### 步驟 4：執行撰寫或更新雙語檔案

1. 參考 `templates/README.template.md` 產出或更新英文版讀我檔案（`README.md`）。若工作區無範本檔，直接依照步驟 3 之標準架構生成。
2. 參考 `templates/README.zh-TW.template.md` 產出或更新繁體中文版讀我檔案（`README.zh-TW.md`）。若工作區無範本檔，直接依照步驟 3 之標準架構生成。
3. 繁體中文規範檢驗：
   - 採用台灣慣用詞彙（軟體、程式、資料、檔案、網路、伺服器、函式、參數、元件、設定、執行、建置）。
   - 專有名詞首次出現且有通行譯名時，強制採用「中文譯名（英文原文）」格式，英文不使用縮寫，後續只寫中文譯名。
   - 程度詞附具體數值或基準，刪除無訊息量的填充詞。

### 步驟 5：總結報告

向使用者回報執行的模式（建立、更新或重構）、更新的章節與檔案清單。
