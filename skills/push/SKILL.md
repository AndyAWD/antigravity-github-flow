---
name: antigravity-github-flow:agy-github-flow:push
description: 執行 git push 將本地變更推送到遠端儲存庫。當使用者輸入 /antigravity-github-flow:agy-github-flow:push 時觸發。
---

# 遠端推播（Push）

將本地端的提交與標籤安全推送到遠端 GitHub 儲存庫。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:agy-github-flow:push`。
2. 當使用者提及「幫我 push」、「推送到 GitHub」、「備份到遠端」時。

## 執行的實作步驟

1. 第一步：遠端狀態擷取（Fetch）
   若專案已設定遠端儲存庫（`git remote`），先透過 `run_command` 執行 `git fetch origin --tags` 獲取遠端最新變更與標籤。

2. 第二步：防呆檢查（Behind Check）
   檢查當前分支是否落後遠端（例如透過 `git status` 或 `git rev-list --left-right --count HEAD...@{u}`）。
   - 若落後遠端（Behind > 0）：向使用者說明「遠端已有新提交，先幫您同步更新」，並執行 `git pull --rebase`（或 `git pull`）完成整合。
   - 若無落後（Behind == 0 或尚未建立遠端分支）：透過 `run_command` 執行 `git push -u origin HEAD --follow-tags` 將當前分支與相關標籤推送到遠端並建立追蹤。
