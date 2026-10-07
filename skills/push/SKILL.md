---
name: agy-github-flow:push
description: 執行 git push 將本地變更推送到遠端儲存庫。當使用者輸入 /agy-github-flow:push 時觸發。
---

# 遠端推播（Push）

將本地端的提交與標籤安全推送到遠端 GitHub 儲存庫。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/agy-github-flow:push`。
2. 當使用者提及「幫我 push」、「推送到 GitHub」、「備份到遠端」時。

## 執行的實作步驟

重要提示：關於腳本執行路徑，由於本技能作為 Plugin 載入，若在衝突排解等必要情境需執行提交，請從您的系統提示詞 `<skills>` 列表中找出 `agy-github-flow:commit`（或 `commit`）技能被載入的絕對路徑（位於括號中），解析為 `scripts/commit.js` 執行，絕不可使用相對路徑。

### 步驟 0：工作區狀態檢查（防越界機制）

1. 執行 `git status --porcelain` 檢查工作區是否乾淨。
2. 若偵測到有未暫存、已暫存或未追蹤的檔案（工作區非乾淨狀態）：
   - 提醒使用者：「偵測到工作區尚有未提交的變更。`push` 僅會推送已提交的 Commit，不會推送未提交的檔案。若您希望將目前的修改一併推送，請先執行 `/agy-github-flow:commit` 完成提交。」
   - **嚴格防越界規範**：嚴格禁止在此處詢問使用者是否代為提交，亦嚴格禁止執行原生 `git add` 或 `git commit` 指令。
   - 若當前分支落後遠端（Behind > 0），因未提交變更會導致 pull/rebase 失敗或發生衝突，**必須強制中止流程**，要求使用者先使用 `/agy-github-flow:commit` 提交或暫存後再推播。

### 步驟 1：遠端狀態擷取（Fetch）

若專案已設定遠端儲存庫（`git remote`），先透過 `run_command` 執行 `git fetch origin --tags` 獲取遠端最新變更與標籤。

### 步驟 2：防呆檢查（Behind Check）

檢查當前分支是否落後遠端（例如透過 `git status` 或 `git rev-list --left-right --count HEAD...@{u}`）。
- 若落後遠端（Behind > 0）：向使用者說明「遠端已有新提交，先幫您同步更新」，引導使用者執行 `/agy-github-flow:pull`（或執行 `git pull --rebase`）完成整合。若發生衝突需完成合併提交，必須透過 `commit` 技能之 `scripts/commit.js` 執行，嚴格禁止執行原生 `git commit` 指令。
- 若無落後（Behind == 0 或尚未建立遠端分支）：透過 `run_command` 執行 `git push -u origin HEAD --follow-tags` 將當前分支與相關標籤推送到遠端並建立追蹤。

## 嚴格禁止事項（Anti-patterns）

1. **嚴格禁止執行原生 `git commit` 指令**：本技能完全不包含提交程式碼的功能。任何程式碼提交必須由 `commit` 技能經由 `scripts/commit.js` 執行，以確保共同作者簽名與慣例式提交格式正確無誤。
2. **嚴格禁止跨技能越界代理提交**：偵測到工作區有未提交變更時，嚴格禁止自行執行 `git add` 或 `git commit` 代使用者提交，必須指引使用者使用 `/agy-github-flow:commit`。
