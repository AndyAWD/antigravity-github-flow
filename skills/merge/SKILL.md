---
name: antigravity-github-flow:agy-github-flow:merge
description: 依照 GitHub Flow 規則執行分支合併至 main 主分支。當使用者輸入 /antigravity-github-flow:agy-github-flow:merge 時觸發。
---

# 分支合併（GitHub Flow Merge）

依照 GitHub Flow 規範，將工作分支安全合併至 main 主分支。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:agy-github-flow:merge`。
2. 當使用者要求「合併分支」、「把分支合併到 main」時。

## 執行的實作步驟

1. 第一步：遠端狀態同步（Fetch）
   若專案設定有遠端儲存庫（`git remote`），先執行 `git fetch --all --prune` 取得遠端所有分支的最新狀態。

2. 第二步：偵測主分支與當前分支
   確認主分支名稱為 `main`（若不存在則檢查 `master`）。
   執行 `git branch --show-current` 取得目前分支名稱。若目前已在主分支上，提示使用者需先切換至欲合併的工作分支。

3. 第三步：確認合併方式（ask_question）
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

   - 若選擇建立 Pull Request：從技能列表中讀取並執行 `antigravity-github-flow:agy-github-flow:github-pr`（或 `github-pr`）技能。
   - 若選擇本地合併：
     1. 切換至主分支（`git checkout main`）。
     2. 若主分支有遠端追蹤，先執行 `git pull --ff-only` 確保主分支為最新狀態。
     3. 執行保留節點的合併指令：`git merge --no-ff <原始工作分支>`。

4. 第四步：衝突處理
   若發生合併衝突：
   - 單純衝突（如非重疊修改）由 AI 嘗試自動排解並執行 `git add -A` 完成合併。
   - 複雜衝突（涉及核心業務邏輯）請保留衝突狀態，並向使用者說明衝突檔案，待使用者確認排解後再繼續。

5. 第五步：分支清理作業（Branch Cleanup）
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
