---
name: antigravity-github-flow:agy-github-flow:init
description: 一鍵為全新專案搭建 GitHub Flow 標準的單一 main 主分支架構。當使用者輸入 /antigravity-github-flow:agy-github-flow:init 時觸發。
---

# GitHub Flow 專案初始化（Init）

本技能旨在為新的 Git 儲存庫建立符合 GitHub Flow 規範的單一主分支架構。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:agy-github-flow:init`。
2. 當使用者要求「初始化專案」、「設定 GitHub Flow」、「建立 main 分支」時。

## 執行的實作步驟

1. 檢查儲存庫狀態：
   執行 `git status` 檢查是否為 Git 儲存庫。若不是，執行 `git init`。
   若專案已設定有遠端儲存庫（`git remote`），先執行 `git fetch --all --prune` 確保取得遠端分支資訊。

2. 建立初始提交（若為空白儲存庫）：
   檢查是否有任何 Commit（例如 `git log -1`）。
   若完全空白，建立一個基礎的 `README.md` 檔案，並執行 `git add -A` 與 `git commit -m "chore: 初始化專案"`。請務必附上 `Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>` 簽名。

3. 設定單一主分支：
   確保當前主分支名稱為 `main`（若為 `master` 則使用 `git branch -m main` 更名）。
   若遠端已有 `origin/main`，則建立追蹤關聯。

4. 總結回報：
   告知使用者專案已成功初始化為 GitHub Flow 單一主分支架構，可以立即開始建立分支開發新功能。
