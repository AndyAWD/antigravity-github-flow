---
name: antigravity-github-flow:agy-github-flow:pull
description: 安全拉取遠端最新進度至當前工作分支。執行時強制先執行 fetch 技能更新全域狀態；若因衝突、分叉、工作區髒污等原因無法直接拉取，自動透過 ask_question 互動選單建議下一步解決方案。當使用者輸入 /antigravity-github-flow:agy-github-flow:pull 或提及「幫我 pull」、「拉取程式碼」時觸發。
---

# 遠端拉取（Pull）

將遠端儲存庫的最新變更整合至當前本地工作分支。本技能具備前置自動 fetch 機制與智慧錯誤診斷建議樹。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:agy-github-flow:pull`。
2. 當使用者提及「幫我 pull」、「從遠端拉取」、「更新最新程式碼」、「同步雲端進度」時。

## 核心執行規則

1. **強制前置 Fetch**：
   - 當使用者直接執行 `pull` 時，系統**強制先執行 fetch**（呼叫 fetch 技能或執行 `scripts/fetch.js`），確保本地物件庫為最新且所有非當前分支已快轉，避免在舊資料基礎上盲目 pull。
2. **多重安全檢查與診斷**：
   - 執行 pull 前透過 `scripts/pull-status.js` 診斷當前分支與工作區狀態。
3. **智慧引導（ask_question 決策樹）**：
   - 若因任何原因（工作區髒污、分叉、衝突、無上游等）無法直接快轉拉取，**絕對禁止擅自進行破壞性操作**，必須呼叫 `ask_question` 工具向使用者呈現條理清晰的下一步建議選單，由使用者做出決定。

## 執行的實作步驟

重要提示：關於腳本執行路徑，由於本技能作為 Plugin 載入，請從您的系統提示詞 `<skills>` 列表中，找出 `antigravity-github-flow:agy-github-flow:pull`（或 `pull`）技能被載入的絕對路徑（位於括號中）。請解析該絕對目錄位置，並替換為 `scripts/` 資料夾的絕對路徑後執行腳本（例如：`node /絕對路徑/scripts/pull-status.js`），絕不可使用相對路徑。

### 第一步：強制執行前置 Fetch
呼叫 `antigravity-github-flow:agy-github-flow:fetch` 技能，或執行 fetch 腳本：
```bash
node <fetch技能絕對目錄>/scripts/fetch.js
```
確保全域遠端狀態已下載至本地。

### 第二步：分支狀態診斷
執行診斷腳本：
```bash
node <pull技能絕對目錄>/scripts/pull-status.js --json
```
根據回傳狀態進行不同分支處理。

### 第三步：狀態分支與 ask_question 互動選單

#### 情境 1：工作區乾淨且可快轉（BEHIND_CAN_FAST_FORWARD）
執行標準安全拉取：
```bash
git pull --ff-only
```
拉取成功後向使用者回報更新的提交清單與最新進度。

#### 情境 2：目前已是最新狀態（CLEAN_UP_TO_DATE）
向使用者說明「目前分支已是最新狀態，無需重複拉取」。

#### 情境 3：本地超前但遠端無新進度（AHEAD_ONLY）
向使用者說明「目前分支超前遠端，無遠端進度需要拉取」，並建議執行 `/antigravity-github-flow:agy-github-flow:push`。

#### 情境 4：工作區有未提交修改（DIRTY_WORKTREE）
無法直接執行安全拉取，呼叫 `ask_question` 工具：
```json
{
  "questions": [
    {
      "question": "偵測到工作區有未提交的修改，無法直接安全拉取。請問您希望如何處理？",
      "options": [
        "(Recommended) 先暫存變更（git stash）後拉取，拉取完畢再還原（git stash pop）",
        "將目前的修改先建立 Commit 後再拉取",
        "放棄本地未提交的修改（git reset --hard）後拉取",
        "取消拉取操作"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "工作區髒污處理建議",
  "toolAction": "詢問未提交修改處理方式"
}
```

#### 情境 5：本地與遠端雙向分叉（DIVERGED）
本地與遠端各自有獨立的新提交，呼叫 `ask_question` 工具：
```json
{
  "questions": [
    {
      "question": "目前分支與遠端已雙向分叉（本地與遠端皆有新提交），請問您偏好哪種整合方式？",
      "options": [
        "(Recommended) 以變基方式拉取（git pull --rebase），保持線型歷史整潔",
        "以普通合併方式拉取（git pull --no-rebase），建立合併節點",
        "放棄本地提交，強制對齊遠端（git reset --hard @{u}）",
        "取消拉取操作"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "分叉分支拉取決策",
  "toolAction": "詢問分叉整合方式"
}
```

#### 情境 6：拉取過程發生合併或變基衝突（CONFLICT）
若執行 pull 遭遇衝突，呼叫 `ask_question` 工具：
```json
{
  "questions": [
    {
      "question": "拉取時與遠端檔案發生內容衝突，請問您希望如何排解？",
      "options": [
        "(Recommended) 請 AI 協助分析衝突標記並逐一排解衝突檔案",
        "中止本次拉取並還原至拉取前狀態（git merge --abort / git rebase --abort）",
        "由我自行手動編輯檔案解決衝突"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "衝突排解決策",
  "toolAction": "詢問衝突處理方式"
}
```

#### 情境 7：目前分支尚未設定上游追蹤（NO_UPSTREAM）
若尚未設定 upstream，呼叫 `ask_question` 工具：
```json
{
  "questions": [
    {
      "question": "目前分支尚未設定遠端追蹤分支，請問您希望如何拉取？",
      "options": [
        "(Recommended) 追蹤遠端同名分支並拉取（git branch --set-upstream-to=origin/<branch> && git pull）",
        "拉取 main 主分支的最新進度整併至當前分支（git pull origin main）",
        "保持獨立，取消拉取"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "未設定追蹤分支引導",
  "toolAction": "詢問上游分支關聯"
}
```

#### 情境 8：分離 HEAD 狀態（DETACHED_HEAD）
呼叫 `ask_question` 工具：
```json
{
  "questions": [
    {
      "question": "目前處於分離 HEAD（Detached HEAD）狀態，未綁定任何分支。請問您希望？",
      "options": [
        "(Recommended) 為目前提交建立新分支並切換（git checkout -b <新分支名>）",
        "切換回 main 分支後拉取最新程式碼（git checkout main && git pull）",
        "取消拉取操作"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "分離 HEAD 處理決策",
  "toolAction": "詢問分離 HEAD 處理方向"
}
```

#### 情境 9：網路連線或憑證驗證失敗（NETWORK_OR_AUTH_ERROR）
呼叫 `ask_question` 工具：
```json
{
  "questions": [
    {
      "question": "遠端連線或憑證驗證失敗，無法完成拉取。請問您希望？",
      "options": [
        "(Recommended) 重新嘗試拉取（Retry）",
        "檢查遠端設定與 GitHub 登入狀態（gh auth status）",
        "取消拉取操作"
      ],
      "is_multi_select": false
    }
  ],
  "toolSummary": "網路連線異常處理",
  "toolAction": "詢問連線失敗重試方式"
}
```
