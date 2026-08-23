---
name: antigravity-github-flow:github-flow:github-pr
description: 建立 Pull Request。允許從任何非 main 分支發起到 main 主分支，且 PR 內容自動產生繁體中文標題與描述。當使用者輸入 /antigravity-github-flow:github-flow:github-pr 時觸發。
---

# 建立拉取請求（Pull Request）

在 GitHub Flow 模式下，從當前工作分支發起 Pull Request 到 main 主分支。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:github-flow:github-pr`。
2. 當使用者提及「發 PR」、「建立 Pull Request」、「發起程式碼審查」時。

## 執行的實作步驟

1. 第一步：遠端狀態同步（Fetch）
   若專案設定有遠端儲存庫（`git remote`），先執行 `git fetch --all` 確保本地端追蹤資訊為最新。

2. 第二步：取得與檢查目前分支
   執行 `git branch --show-current`。
   若目前分支為 `main` 或 `master`，請提示使用者：「目前已在主分支上，PR 必須由工作分支發起。請先切換至欲發布的工作分支。」並中斷流程。

3. 第三步：確認遠端推送狀態
   檢查當前分支是否已推送到遠端。若尚未推送或有新的本地提交，先執行 `git push -u origin HEAD` 確保遠端有完整提交紀錄。

4. 第四步：分析變更並產生繁體中文 PR 內容
   讀取與目標分支（`main` 或 `master`）之間的 commit 紀錄（例如 `git log origin/main..HEAD`）。
   總結此次變更重點，以繁體中文撰寫清晰的標題（Title）與描述（Body）。

5. 第五步：環境檢查與建立 PR
   執行 `gh auth status` 檢查 GitHub CLI（gh）是否已安裝且登入：
   - 情境 A（已安裝且已登入）：
     執行指令：`gh pr create --title "<繁體中文標題>" --body "<繁體中文描述>" --base main`，自動建立 Pull Request 並將連結回報給使用者。
   - 情境 B（未安裝或未登入）：
     停止後續動作，並提示使用者：「請先安裝 GitHub CLI（gh）並執行 `gh auth login` 完成登入後，再重新執行 `/antigravity-github-flow:github-flow:github-pr`。」
