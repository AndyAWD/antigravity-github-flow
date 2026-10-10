---
name: agy-github-flow:commit
description: "依照慣例式提交（Conventional Commits）v1.0.0 規範自動產生 git commit。分析目前工作區變更，若包含多個獨立任務會自動拆分成多個 commit。整合 GitHub Flow 分支策略。所有 commit 必須使用 scripts/commit.js 提交並附帶官方共同作者簽名 Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>。當使用者輸入 /agy-github-flow:commit 或提及「幫我 commit」、「整理提交」等字眼時觸發。"
---

# 慣例式提交與 GitHub Flow 規範

依照慣例式提交（Conventional Commits）v1.0.0 規範產生提交訊息，並整合 GitHub Flow 分支策略。

## 什麼是慣例式提交規範？

1. 提交訊息整體結構：
   ```text
   <type>[optional scope]: <description>

   [optional body]

   [optional footer(s)]
   ```
   - 標題行包含類型（type）、範圍（scope）與描述（description）。
   - 標題行與主體（body）之間必須留有一行空白行。
   - 主體與結尾（footer）之間必須留有一行空白行。

2. 類型（Type）定義（全部小寫）：
   - `feat`: 新增功能（feature）
   - `fix`: 修復錯誤（bug fix）
   - `docs`: 僅修改文件（documentation）
   - `style`: 程式碼風格調整，不影響運行邏輯（如空格、縮排、缺少分號等）
   - `refactor`: 重構程式碼（既非新增功能也非修復錯誤）
   - `perf`: 改善效能（performance）
   - `test`: 新增或修改測試（test）
   - `build`: 影響建置系統或外部依賴的變更（如 npm, gradle 等）
   - `ci`: 修改持續整合（CI）的設定檔或腳本
   - `chore`: 其他雜項工作，未修改原始碼或測試檔（如更新 .gitignore）
   - `revert`: 撤銷先前的 commit，body 中應註明 `This reverts commit <hash>.`

3. 範圍（Scope）：
   - 可選項目。用英文小寫括號包住，提供模組或元件名稱，例如 `feat(auth):`。

4. 描述（Description）：
   - 必須緊接在冒號與一個半形空白之後。
   - 必須使用繁體中文撰寫（例如 `新增登入 API`）。
   - 標題行總長度建議不超過 72 個字元。

5. 主體（Body）：
   - 可選項目。說明為什麼進行這些變更或變更了哪些具體行為。
   - 必須使用繁體中文撰寫。

6. 結尾（Footer）：
   - 用於標註關聯的 Issue 編號（如 `Closes #123`）或共同作者簽名。

7. 重大變更（Breaking Changes）：
   - 若變更會破壞向後相容性，必須在 type 或 scope 後方加上驚嘆號 `!`（如 `feat!:` 或 `feat(api)!:`），或在 footer 標註 `BREAKING CHANGE: <繁體中文描述>`。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/agy-github-flow:commit`。
2. 當使用者提及「幫我 commit」、「幫我提交」、「整理提交」、「拆 commit」時。

## 互動與分支確認規則（ask_question）

在執行過程中，若目前在主分支（main 或 master），必須呼叫 `ask_question` 工具詢問使用者的意圖：

```json
{
  "questions": [
    {
      "question": "目前在 main 主分支上，請問您希望如何處理這次的提交？",
      "options": [
        "(Recommended) 從 main 切出新分支進行提交（如 feature/*, fix/* 等）",
        "直接提交到 main 主分支",
        "取消目前操作"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "確認提交分支方式",
  "toolAction": "詢問主分支提交意圖"
}
```

若使用者選擇切出新分支，請接著引導分支名稱並呼叫 `scripts/branch-guard.js <type> <name>` 建立分支。

### 未追蹤檔案之審查與多選確認（git add 階段）

當偵測到工作區存在未追蹤檔案（沒有被版本控制的檔案）時，必須先看過檔案內容並說明功能、依相同類型群組展示，再使用 `ask_question` 工具（使用者提示詞中亦稱 `ask_user_question`，多檔案時使用 `is_multi_select: true` 多選模式）詢問使用者：

#### 1. 多個未追蹤檔案時（多選模式：ask_user_question / ask_question）

在呼叫工具前，先在對話中以 Markdown 輸出群組與檔案功能說明，接著呼叫多選確認：

```json
{
  "questions": [
    {
      "question": "偵測到以下未追蹤檔案並已完成功能分析。請選擇要加入版本控制的檔案：",
      "options": [
        "將 [src/auth.js](file:///workspace/src/auth.js) 加入版本控制（[程式原始碼] 處理使用者登入與 JWT 權杖簽署）",
        "將 [config/app.json](file:///workspace/config/app.json) 加入版本控制（[設定與組態] 應用程式 API 端點與連線逾時設定）",
        "將 [docs/api.md](file:///workspace/docs/api.md) 加入版本控制（[說明文件] REST API 規格說明書）",
        "將 [tests/auth.test.js](file:///workspace/tests/auth.test.js) 加入版本控制（[測試檔案] 登入驗證單元測試）"
      ],
      "is_multi_select": true
    }
  ],
  "toolSummary": "選擇加入版本控制的檔案",
  "toolAction": "多選勾選未追蹤檔案納入版本控制清單"
}
```

若有多個檔案且使用者僅勾選其中部分（或皆未勾選），針對剩餘未選取之檔案，進一步確認處置意圖（丟棄、忽略或保留）：

```json
{
  "questions": [
    {
      "question": "針對未勾選加入版本控制的檔案，請問希望如何處置？",
      "options": [
        "(Recommended) 加入 .gitignore 忽略這些檔案",
        "暫不加入版本控制（保留在工作區但不追蹤）",
        "丟棄這些檔案（自工作區刪除）"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "確認未選取檔案處置",
  "toolAction": "詢問未選取檔案之丟棄或忽略處置"
}
```

> **注意（合約協調）**：若使用者選擇「暫不加入版本控制（保留在工作區但不追蹤）」，外掛其餘所有技能（如 push, pull, merge, release, tag 等）步驟 0 已全面採用 `git status --untracked-files=no --porcelain`，未追蹤檔案不會阻塞後續流程；但仍建議透過 `.gitignore` 排除以維護工作區整潔。

#### 2. 單一未追蹤檔案時（單選模式）

```json
{
  "questions": [
    {
      "question": "偵測到未追蹤檔案 [path/to/file](file:///workspace/path/to/file)（功能：<功能摘要說明>），請問是否要加入版本控制？",
      "options": [
        "(Recommended) 加入版本控制（執行 git add）",
        "加入 .gitignore 忽略此檔案",
        "暫不加入版本控制（保留在工作區但不追蹤）",
        "丟棄此檔案（自工作區刪除）"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "確認單一檔案處置",
  "toolAction": "詢問未追蹤檔案是否納入版本控制"
}
```

## 執行的 8 個步驟

重要提示：關於腳本執行路徑，由於本技能作為 Plugin 載入，請從您的系統提示詞 `<skills>` 列表中，找出 `agy-github-flow:commit`（或 `commit`）技能被載入的絕對路徑（位於括號中）。請解析該絕對目錄位置，並替換為 `scripts/` 資料夾的絕對路徑後執行腳本（例如：`node /絕對路徑/scripts/analyze.js`），絕不可使用相對路徑。

1. 第一步：確認當前分支。若在 `main` 或 `master`，則執行上述 `ask_question` 流程。
2. 第二步：未追蹤檔案功能檢視、群組分類與版本控制確認（git add 階段防護）。
   - **偵測未追蹤檔案**：執行 `node <commit技能目錄>/scripts/inspect-untracked.js`（或加上 `--json` 取得結構化資料；亦可搭配 `git -c core.quotePath=false ls-files --others --exclude-standard` 雙重確認）。
   - **無未追蹤檔案**：若無任何未追蹤檔案，直接精準將已修改的追蹤檔案加入暫存區（或執行 `git add -u`），進入第三步。
   - **有未追蹤檔案時的必要流程**：
     1. **看過並說明檔案功能**：
        - 助理必須使用 `view_file` 或讀取檔案內容確實檢視每一個未追蹤檔案（大型或二進位檔案則檢視其檔名、目錄與大小）。
        - 提煉並說明每個檔案的作用與功能（例如：定義何種邏輯、提供何種功能、組態設定項目、文件說明或測試案例）。
     2. **相同類型檔案依群組顯示**：
        - 將相同類型或用途的檔案進行群組化歸納（例如：程式原始碼群組、設定與組態群組、建置與相依性群組、說明文件群組、測試檔案群組、樣式與標記群組、暫存與記錄檔群組等）。
        - 在向使用者提問之前，以 Markdown 結構化清單呈現各群組名稱與每個檔案的功能說明。
     3. **詢問是否加入版本控制**：
        - **多個檔案**：呼叫 `ask_question` 工具（使用者提示詞中亦稱 `ask_user_question`，設定 `is_multi_select: true` 多選模式），選項中列出各檔案（標註群組名稱與功能摘要）供使用者逐一勾選要加入版本控制的檔案。
        - **單一檔案**：呼叫 `ask_question`（`is_multi_select: false`），呈現該檔案功能後詢問處置方式（加入版本控制 / 暫不加入版本控制 / 加入 .gitignore / 丟棄刪除）。
     4. **處置未選取檔案**：
        - 若有未被選取的檔案，依上述確認處置規則詢問處置方式（保留不追蹤 / 加入 .gitignore / 丟棄刪除）。
     5. **執行加入或處置**：
        - 針對確定要納入版本控制的檔案，執行精準 `git add <檔案1> <檔案2>...`。
        - 針對選擇忽略的檔案，將路徑規則附加至專案根目錄 `.gitignore`。
        - 針對選擇丟棄的檔案，執行檔案刪除。
        - 針對保留的檔案，維持未追蹤狀態不予加入暫存。
        - **嚴格禁止**未經檢視與使用者同意無差別執行 `git add -A`。
3. 第三步：透過 `run_command` 執行 `scripts/analyze.js` 蒐集工作區狀態與 diff 資訊。
4. 第四步：依 diff 內容自動分析並拆分獨立任務群組。
5. 第五步：執行 `scripts/branch-guard.js <type> <branch-name>` 確保分支正確。
6. 第六步：決定每組任務的 type 與 scope。
7. 第七步：撰寫符合規範的訊息（type 與 scope 保持英文，description 與 body 必須使用繁體中文）。
8. 第八步：針對每組任務，執行 `git reset` 重設暫存區，接著精準 `git add` 該組檔案，最後執行 `scripts/commit.js "<訊息>"` 完成提交。

## 提交規範與簽名

所有提交訊息最下方必須包含共同作者簽名：

```text
<type>[optional scope]: <繁體中文描述>

[optional body]

Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>
```

## 嚴格禁止事項（Anti-patterns）

1. **嚴格禁止執行原生 `git commit` 指令**：所有提交必須統一呼叫 `scripts/commit.js` 執行，嚴格禁止直接使用 `git commit -m` 或其他原生提交指令，以防止遺漏官方共同作者簽名或繞過簽名正規化驗證。
2. **嚴格禁止使用非官方共同作者簽名變體**：共同作者簽名必須嚴格為 `Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>`，嚴格禁止使用個人信箱或其他非官方格式。
3. **嚴格禁止未經檢視與未經使用者確認直接提交未追蹤新檔案**：若偵測到未追蹤檔案，必須確實看過檔案內容並說明其功能、同類型檔案依群組呈現，並透過 `ask_question`（使用者提示詞中亦稱 `ask_user_question`，多檔案時使用多選模式 `is_multi_select: true`）由使用者親自挑選要納入版本控制的檔案，嚴禁未看過檔案內容即盲目詢問或無差別全量暫存（`git add -A`）。
