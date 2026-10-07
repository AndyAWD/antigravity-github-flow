---
name: agy-github-flow:merge
description: 依照 GitHub Flow 規則執行分支合併至 main 主分支。當使用者輸入 /agy-github-flow:merge 時觸發。
---

# 分支合併（GitHub Flow Merge）

依照 GitHub Flow 規範，將工作分支安全合併至 main 主分支。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/agy-github-flow:merge`。
2. 當使用者要求「合併分支」、「把分支合併到 main」時。

## 執行的實作步驟

重要提示：關於腳本執行路徑，由於本技能作為 Plugin 載入，請從您的系統提示詞 `<skills>` 列表中，找出 `agy-github-flow:commit`（或 `commit`）技能被載入的絕對路徑（位於括號中）。請解析該絕對目錄位置，並替換為 `scripts/commit.js` 執行提交腳本，絕不可使用相對路徑。

### 步驟 0：工作區狀態檢查（防越界機制）

1. 執行 `git status --porcelain` 檢查工作區是否乾淨。
2. 若偵測到有未暫存、已暫存或未追蹤的檔案（工作區非乾淨狀態）：
   - **必須立即中止流程**，嚴格禁止在本技能內自行拼湊或執行原生 `git add` 或 `git commit` 指令，亦嚴格禁止詢問使用者是否代為提交。
   - 明確提示使用者：「偵測到工作區尚有未提交的變更。合併前工作區必須保持乾淨，避免切換分支或合併時發生檔案衝突。請先使用 `/agy-github-flow:commit` 完成正規提交流程後再執行合併。」

### 步驟 1：遠端狀態同步（Fetch）

若專案設定有遠端儲存庫（`git remote`），先執行 `git fetch --all --prune` 取得遠端所有分支的最新狀態。

### 步驟 2：偵測主分支與當前分支

1. 確認主分支名稱為 `main`（若不存在則檢查 `master`）。
2. 執行 `git branch --show-current` 取得目前分支名稱。若目前已在主分支上，提示使用者需先切換至欲合併的工作分支。

### 步驟 3：確認合併方式（ask_question）

在 GitHub Flow 中，強烈建議透過 GitHub 建立 Pull Request 進行審查與合併；若使用者偏好本地合併，亦提供本地直接合併模式：

```json
{
  "questions": [
    {
      "question": "目前在工作分支，請問您希望如何進行合併？",
      "options": [
        "(Recommended) 透過 GitHub 建立 Pull Request 進行審查與線上合併",
        "直接在本地端將目前分支合併至 main 主分支"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "確認合併方式",
  "toolAction": "詢問合併偏好"
}
```

- 若選擇建立 Pull Request：從技能列表中讀取並執行 `agy-github-flow:github-pr`（或 `github-pr`）技能。
- 若選擇本地合併：
  1. 切換至主分支（`git checkout main`）。
  2. 若主分支有遠端追蹤，先執行 `git pull --ff-only` 確保主分支為最新狀態。
  3. 執行保留節點的合併指令：`git merge --no-ff <原始工作分支>`。

### 步驟 4：衝突處理

若發生合併衝突：
- 單純衝突（如非重疊修改）由 AI 嘗試自動排解，排解後僅針對衝突檔案執行精準暫存（`git add <衝突檔案>`，嚴格禁止無差別 `git add -A`）。
- 完成合併提交時，**必須執行 commit 技能之腳本執行提交**：
  ```bash
  node <commit技能絕對目錄>/scripts/commit.js "Merge branch '<原始工作分支>' into main"
  ```
  （該腳本會自動注入官方共同作者簽名 `Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>`）。
  **嚴格禁止執行原生 `git commit` 指令**。
- 複雜衝突（涉及核心業務邏輯）請保留衝突狀態，並向使用者說明衝突檔案，待使用者確認排解後再繼續。

### 步驟 5：分支清理作業（Branch Cleanup）

合併順利完成後，使用 `ask_question` 工具（啟用多選）詢問使用者是否刪除已合併的原始分支：

```json
{
  "questions": [
    {
      "question": "合併已順利完成！請問您是否要刪除剛才合併的原始分支來保持儲存庫乾淨？",
      "options": [
        "刪除本地分支",
        "刪除遠端分支",
        "保留分支，不刪除"
      ],
      "is_multi_select": true
    }
  ],
  "toolSummary": "確認刪除分支",
  "toolAction": "詢問分支刪除意願"
}
```

- 勾選刪除本地分支：執行 `git branch -d <原始工作分支>`。
- 勾選刪除遠端分支：執行 `git push origin --delete <原始工作分支>`。
- 勾選保留分支或未勾選：保持現狀，結束流程。

## 嚴格禁止事項（Anti-patterns）

1. **嚴格禁止執行原生 `git commit` 指令**：所有提交與衝突排解後之合併提交，必須統一由 `scripts/commit.js` 執行，以確保共同作者簽名與格式正確無誤。
2. **嚴格禁止在非乾淨工作區執行分支切換或合併**：若偵測到未提交變更，必須直接中斷並向使用者明確說明，嚴格禁止自行詢問代為提交或私自執行 git 提交指令。
3. **嚴格禁止無差別全量暫存（`git add -A`）**：排解衝突時僅允許精準暫存已解決衝突的檔案。
