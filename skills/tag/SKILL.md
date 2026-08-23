---
name: antigravity-github-flow:tag
description: 依據 SemVer 2.0.0 規範，分析 main 主分支上未標籤的合併節點，自動判斷版號並打上 vX.Y.Z 格式的 Tag。支援手動指定版號。若不在主分支則拒絕執行。當發現多個未標籤合併節點時，會詢問使用者範圍。當使用者輸入 /antigravity-github-flow:tag 時觸發。
---

# 自動版號標記（SemVer Tagging）

本技能旨在為 `main`（或 `master`）主分支的合併節點依據語意化版本（Semantic Versioning / SemVer 2.0.0）規範打上版本標籤（Tag）。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:tag`。
2. 當使用者要求「打 tag」、「標記版本」、「自動判斷版號」時。

## 執行的實作步驟

1. 第一步：防呆機制（Branch Guard）與標籤同步
   - 若專案設定有遠端儲存庫（`git remote`），先執行 `git fetch --all --tags --prune` 確保本機取得遠端所有的標籤與提交歷史。
   - 執行 `git branch --show-current` 檢查當前分支。
   - 若當前分支不是 `main` 或 `master`，立即中斷流程，並告知使用者：「標記版本號必須在 main 主分支上執行，請先切換分支。」
   - 若主分支落後遠端，先執行 `git pull --ff-only` 確保本地主分支為最新狀態。

2. 第二步：檢查手動指定版號
   - 若使用者在呼叫技能時明確提供版號（例如：`/antigravity-github-flow:tag v1.2.3`）。
   - 直接跳過後續的 SemVer 分析，使用指令 `git tag <手動版號>` 在最新節點打上標籤，並提示使用者推播（`git push --tags`），結束流程。

3. 第三步：找出未標籤的合併節點
   - 使用 `git log --merges main` 找出所有的合併節點。
   - 比對現有 Tag，過濾出尚未被打上 Tag 的合併節點。

4. 第四步：處理多個未標籤節點（ask_question）
   - 若只有一個未標籤的合併節點，直接進入第五步。
   - 若有多個未標籤的合併節點，使用 `ask_question` 工具向使用者確認範圍：

   ```json
   {
     "questions": [
       {
         "question": "發現多個未標籤的合併節點，請問要標籤哪種範圍？",
         "options": [
           "(Recommended) 僅把最近的一次合併節點打上版本號",
           "全部的合併節點都要打上標籤"
         ],
         "is_multi_select": false
       }
     ],
     "toolSummary": "確認標籤範圍",
     "toolAction": "詢問要標籤幾個合併節點"
   }
   ```

5. 第五步：版號判斷（SemVer 2.0.0）
   針對每個確定要打 Tag 的合併節點：
   - 使用 `git log <前一個Tag>..<合併節點>` 分析變更歷史。
   - 依據 SemVer 2.0.0 進行判斷：
     1. MAJOR（X.y.z）：當有不相容的 API 變更、破壞性變更（BREAKING CHANGE）時遞增。
     2. MINOR（x.Y.z）：當加入向下相容的新功能（feat）時遞增。
     3. PATCH（x.y.Z）：當加入向下相容的錯誤修正（fix）、優化或重構時遞增。
   - 取得前一個最新的 Tag 進行加算。
   - 最終產出的版號必須加上 `v` 前綴（例如 `v1.3.0`）。

6. 第六步：執行標記與推播提示
   - 對於每個新版號，執行 `git tag <版號> <合併節點的 hash>`。
   - 執行完成後，向使用者總結打上的 Tag，並從技能列表中讀取並執行 `antigravity-github-flow:push`（或 `push`）技能，將標籤同步至遠端。
