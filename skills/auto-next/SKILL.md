---
name: agy-github-flow:auto-next
description: 專為不熟悉 Git 的使用者設計的自動模式，AI 會自動分析專案當前狀態，並決定下一步最適合的 GitHub Flow 操作（如初始化、提交、推播、發起 PR 或發布），並主動引導。
---

# 智慧導航（Auto Next）技能指令

## 什麼是此技能的目標？

當使用者輸入 `/agy-github-flow:auto-next`，或是表達「我接下來要做什麼」、「自動幫我推進」時，請扮演貼心的版本控制管家，自動分析當前工作區狀態並執行最合適的 GitHub Flow 操作。

重要提示：關於腳本執行路徑，由於本技能作為 Plugin 載入，請從您的系統提示詞 `<skills>` 列表中，找出各技能（如 `fetch`, `commit`, `pull`, `init` 等）被載入的絕對路徑（位於括號中）。請解析該絕對目錄位置，並替換為對應 `scripts/` 資料夾的絕對路徑執行（例如：`node <fetch技能絕對目錄>/scripts/fetch.js`），絕不可使用相對路徑。

## 執行的階段與判斷邏輯

請在背景安靜檢查，不要將生硬的指令輸出給使用者，只需用親切白話文說明即將執行的動作。

### 前置預備程序（Pre-flight Hook）

- **階段零：全域遠端狀態擷取與多分支快轉（Remote Fetch & Multi-branch Fast-forward）**
  - **條件**：若當前專案為 Git 儲存庫且設定有遠端儲存庫（`git remote` 有輸出）。
  - **行動**：在背景執行 `agy-github-flow:fetch`（或 `fetch`）技能（執行 `node <fetch技能絕對目錄>/scripts/fetch.js`）。這將自動執行 `git fetch --all --prune --tags`，並在背景嘗試將所有非當前所在之本地分支安全快轉更新至最新遠端節點（遵循「不行的話就算了」原則），同時獲取當前分支之落後與超前狀態。
  - **流程控制規範**：**本階段為無條件前置準備動作，執行完畢後必須繼續向下評估後續狀態機判斷，嚴格禁止在此處提前終止流程**。

---

### 狀態診斷與優先順序檢查（依序向下評估，命中第一項即執行）

1. **前置檢查 A：衝突排解狀態檢測（Conflict / In-Progress Resolution）**
   - **條件**：存在 `.git/MERGE_HEAD`、`.git/rebase-merge`、`.git/rebase-apply`，或是 `git status --porcelain` 包含未合併檔案標記（如 `UU`, `AA`, `UD`, `DU` 等）。
   - **行動**：向使用者說明「偵測到目前儲存庫處於合併（Merge）或變基（Rebase）衝突狀態。請先完成衝突檔案排解，或執行 `git merge --abort` / `git rebase --abort` 放棄變更。在衝突未排解前，嚴格禁止進行一般提交。」並中斷流程引導排解。**嚴格禁止呼叫 commit 技能**。

2. **前置檢查 B：分離標頭狀態檢測（Detached HEAD Detection）**
   - **條件**：執行 `git symbolic-ref --short HEAD` 失敗或 `git branch --show-current` 為空（處於 Detached HEAD 狀態）。
   - **行動**：向使用者說明「目前處於分離標頭（Detached HEAD）狀態，未綁定任何具名分支。建議您切換回主幹分支或為目前節點建立分支（如 `git checkout -b <branch-name>`）後再繼續。」並結束流程。

3. **階段一：保護工作進度（Save Progress）**
   - **條件**：專案為 Git 儲存庫，且工作區有修改、新增或刪除的檔案（先以 `git status --untracked-files=no --porcelain` 檢查已追蹤檔案之修改，或有未納入版本控制之全新檔案）。
   - **行動**：向使用者說明「發現您有寫好的新程式碼，我先幫您把進度存起來！」，接著從技能列表中讀取並執行 `agy-github-flow:commit`（或 `commit`）技能。**嚴格禁止直接拼湊或執行原生 `git commit` 指令**。

4. **階段二：基礎建設（Infrastructure）**
   - **條件**：執行 `git status` 失敗（代表沒有 `.git` 目錄），或是缺少 `main`（或 `master`）主分支。
   - **行動**：向使用者說明「目前專案還沒設定好版本控制」，接著從技能列表中讀取並執行 `agy-github-flow:init`（或 `init`）技能。

5. **前置檢查 C：已合併分支檢測（Merged Branch Detection & Anti-Zombie）**
   - **條件**：目前在非 main/master 的工作分支（如 `feature/*`, `fix/*` 等），工作區乾淨，且符合以下任一「已整併進主分支」條件：
     1. **歷史祖先檢測**：執行 `git merge-base --is-ancestor HEAD origin/main`（或本地 `main`）為真（適用於一般 Merge Commit、Fast-Forward 與 Rebase 合併）。
     2. **Squash Merge 樹狀差異比對**：若線上或本地採用壓制合併（Squash and Merge），提交歷史無法直接溯源，比對 `git merge-tree origin/main HEAD`（或 `main`）之結果是否與 `git rev-parse origin/main^{tree}`（或 `main^{tree}`）完全一致。若樹狀 SHA 相同，代表當前分支之所有檔案變更已完整併入主分支。
     3. **GitHub CLI 線上狀態檢測**：若支援 `gh` CLI，執行 `gh pr view --json state -q .state`，若回傳 `MERGED`，代表線上 PR 已合併。
   - **行動**：代表當前分支先前已在線上審查合併完成（且遠端分支已被修剪刪除）。向使用者說明「目前分支的變更已在 main 主分支合併完成！我將協助您切換回 main 主分支並清理已合併的本地分支。」執行 `git checkout main`，若有遠端則執行 `git pull --ff-only` 更新本地 main，並建議刪除已合併本地分支（`git branch -d <branch>`，若為 Squash Merge 則提示可使用 `-D`）。**嚴格禁止再次推播或重複發起 PR，避免分支死灰復燃**。

6. **階段三：同步與協作（Sync）**
   - **前提**：專案設定有遠端儲存庫（`git remote` 有輸出）。若為純本地儲存庫，略過此階段直接進入階段四。
   - **條件 1**：工作區乾淨，但本地分支落後遠端（behind remote，Behind > 0），或與遠端雙向分叉（diverged）。
     - **行動**：向使用者說明「發現雲端有新進度，先幫您同步更新下來！」，接著從技能列表中讀取並執行 `agy-github-flow:pull`（或 `pull`）技能。
   - **條件 2**：工作區乾淨，但本地分支超前遠端（ahead of remote，Ahead > 0）。
     - **行動**：向使用者說明「您的程式碼已經存好了，現在幫您備份到雲端！」，接著從技能列表中讀取並執行 `agy-github-flow:push`（或 `push`）技能。
   - **條件 3**：工作區乾淨，本地分支尚未建立上游追蹤關聯（`@{u}` 為空）：
     - 檢查遠端是否已有同名分支：
       - 若遠端已存在同名分支（如 `refs/remotes/origin/<branch>` 存在）：向使用者說明「遠端已存在同名分支，先為您建立追蹤並拉取最新進度以防衝突」，執行 `git branch --set-upstream-to=origin/<branch>` 後調用 `pull` 技能。
       - 若遠端確無同名分支：向使用者說明「準備為您的新分支建立遠端備份」，調用 `push` 技能（`git push -u origin HEAD`）。

7. **階段四：流程推進（Flow Progression）**
   - **情境 1：目前在 main 或 master 主分支，且有新節點尚未打標籤（Tag）**：
     - **檢查**：執行 `git describe --tags --abbrev=0` 查詢上一個 Tag。
       - 若存在上一個 Tag：比對 `git log <最新Tag>..HEAD --oneline`，若有未標記之新節點，代表剛完成新版本整併，讀取並執行 `agy-github-flow:tag`（或 `tag`）技能，接著建議執行 `agy-github-flow:github-release`。
       - 若尚無任何標籤（初始版本發布）：
         - 若僅有專案初始化提交或提交數極少，使用 `ask_question` 工具詢問使用者意圖：
           ```json
           {
             "questions": [
               {
                 "question": "目前在 main 主分支且尚未建立任何版本標籤。請問是否準備進行初版發布（例如標記 v1.0.0）？",
                 "options": [
                   "(Recommended) 暫不標記，準備開發新功能（進入下一步選單）",
                   "是，進行初版發布並打上版本標籤（執行 tag 技能）"
                 ],
                 "is_multi_select": false
               }
             ],
             "toolSummary": "初始版本確認",
             "toolAction": "詢問初始版本標籤意圖"
           }
           ```
           使用者選擇標記時執行 `tag` 技能；選擇暫不標記則進入階段五。
   - **情境 2：目前在非 main 的工作分支（如 feature/*, fix/* 等），工作區乾淨且已推送到遠端**：
     - **檢查線上 PR 狀態（PR State Check）**：若環境支援 `gh` CLI，先執行 `gh pr view --json state,url -q ".state"` 檢查：
       - 若目前分支 PR 狀態為 `MERGED`：代表線上已合併完成，引導執行「前置檢查 C」流程（切換回 `main` 並清理分支），**嚴格禁止重複發起 PR**。
       - 若目前分支已有開啟中（OPEN）的 PR：向使用者說明「目前分支已在 GitHub 上發起 Pull Request 進行審查中，正在等待 Review 與線上合併。您可以繼續在本地進行修改提交，或等待 PR 線上合併完成後再執行 auto-next。」**嚴格禁止重複執行 github-pr**。
     - **意圖確認（Confirmation Prompt）**：若無開啟中的 PR，使用 `ask_question` 工具確認使用者開發完成意圖：
       - 題目：「目前工作分支進度已推播至雲端。請問本功能/修復是否已開發完畢，準備發起 Pull Request 審查（或進行合併）？」
       - 選項：`["(Recommended) 是，功能已完成，準備發起 PR 審查", "否，仍在開發中，暫時保留分支"]`
       - 使用者選擇「是」時，讀取並執行 `agy-github-flow:github-pr`（或依使用者偏好執行 `agy-github-flow:merge`）技能；選擇「否」則保留現狀並結束流程。
   - **情境 3：純本地儲存庫（無 remote）**：
     - 若在工作分支且工作區乾淨，直接以 `ask_question` 詢問是否進行本地合併回 `main` 主分支。

8. **階段五：迷航求助（Fallback）**
   - **條件**：目前狀態非常健康（在 `main` 或 `master` 主分支且一切同步乾淨），沒有明顯的下一步。
   - **行動**：使用 `ask_question` 工具顯示互動選單，詢問使用者想做什麼：
     - 標題：「目前的專案狀態很健康，都已經妥善儲存囉！接下來您想做什麼呢？」
     - 選項：
       1. (Recommended) 開發新功能（執行 `git checkout -b feature/<name> main`）
       2. 修復 Bug（執行 `git checkout -b fix/<name> main`）
       3. 準備發布新版本（執行 `agy-github-flow:release` 技能）
       4. 從雲端擷取並拉取最新程式碼（執行 `agy-github-flow:pull` 技能）

## 溝通準則

1. 保持安心感：在執行任何動作前，先用一句話報備，讓使用者清楚知道下一步動作。
2. 保持白話：避免拋出冗長的終端機錯誤，轉化為易懂的建議。

## 嚴格禁止事項（Anti-patterns）

1. **嚴格禁止執行原生 `git commit` 指令**：auto-next 技能僅負責流程分析與技能調度，嚴格禁止自行拼湊或執行原生 `git commit` 指令。任何程式碼提交行為必須嚴格委派由 `commit` 技能（經由 `scripts/commit.js`）執行，以確保共同作者簽名與慣例式提交格式正確無誤。
2. **嚴格禁止跨技能越界代理**：遇到未提交變更時，必須引導至標準 `commit` 技能流程執行，絕不可私自越界代為提交。
3. **嚴格禁止衝動自動發起 PR 或合併**：工作分支推播後必須經過使用者確認開發完成意圖，嚴禁擅自直接發起 PR 或合併。
4. **嚴格禁止重複發起 PR 與復活已合併分支**：偵測到分支已有 OPEN PR 時不得重複發起 PR；偵測到已合併回 main 時應切換回 main 並清理分支，嚴禁再次推播。
