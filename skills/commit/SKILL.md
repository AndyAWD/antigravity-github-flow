---
name: antigravity-github-flow:commit
description: 依照慣例式提交（Conventional Commits）v1.0.0 規範自動產生 git commit。分析目前工作區變更，若包含多個獨立任務會自動拆分成多個 commit。整合 GitHub Flow 分支策略。所有 commit 的 author 與 committer 都將強制加上 Google Antigravity 共同作者簽名。當使用者輸入 /antigravity-github-flow:commit 或提及「幫我 commit」、「整理提交」等字眼時觸發。
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

1. 當使用者輸入 `/antigravity-github-flow:commit`。
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

## 執行的 8 個步驟

重要提示：關於腳本執行路徑，由於本技能作為 Plugin 載入，請從您的系統提示詞 `<skills>` 列表中，找出 `antigravity-github-flow:commit`（或 `commit`）技能被載入的絕對路徑（位於括號中）。請解析該絕對目錄位置，並替換為 `scripts/` 資料夾的絕對路徑後執行腳本（例如：`node /絕對路徑/scripts/analyze.js`），絕不可使用相對路徑。

1. 第一步：確認當前分支。若在 `main` 或 `master`，則執行上述 `ask_question` 流程。
2. 第二步：執行 `git ls-files --others --exclude-standard` 檢查是否有未追蹤的新檔案。
   - 若有新檔案，必須暫停並列出清單，使用 `ask_question` 詢問安全確認。
   - 提供選項：「(Recommended) 這些檔案都安全，全部加入」、「裡面有敏感檔案，我要加入 .gitignore」、「這次先不提交這些新檔案」。
   - 若無新檔案，則直接執行 `git add -A`。
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
