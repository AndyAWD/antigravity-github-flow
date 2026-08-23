---
name: antigravity-github-flow:github-release
description: 建立 GitHub Release。自動擷取 commit 紀錄產生中英文雙語 Changelog。當使用者輸入 /antigravity-github-flow:github-release 時觸發。
---

# 建立 GitHub Release

在 GitHub 上發布新版本，並自動彙整中英文雙語發布說明（Release Notes）。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:github-release`。
2. 當使用者提及「幫我建立 release」、「發布版本」時。

## 執行的實作步驟

1. 第一步：確認版本號
   呼叫 `ask_question` 工具詢問使用者要發布的版本號（例如 `v1.0.0`）。

2. 第二步：標籤同步與擷取 Commit 紀錄
   - 若專案設定有遠端儲存庫，先執行 `git fetch --all --tags` 確保取得最新的標籤與提交歷史。
   - 找出上一個 tag：執行 `git describe --tags --abbrev=0`（若尚無 tag 則獲取所有 commit）。
   - 獲取期間內的 commit 紀錄：執行 `git log <上一個 tag>..HEAD --oneline`。

3. 第三步：產生中英文雙語 Changelog
   - 分析並整理這些 commit，將其分類（如 Feat, Fix, Refactor, Style, Test, Docs 等）。
   - 產生以下格式的中英文雙語發布紀錄：

   ```markdown
   ### What's Changed

   #### English
   - Feat: [英文描述] by @[GitHub 帳號]
   - Fix: [英文描述] by @[GitHub 帳號]

   #### 繁體中文
   - 新功能: [繁體中文描述] by @[GitHub 帳號]
   - 修正: [繁體中文描述] by @[GitHub 帳號]
   ```

4. 第四步：環境檢查與建立 Release
   執行 `gh auth status` 檢查 GitHub CLI 是否已安裝且已登入：
   - 若已安裝且已登入：
     使用產生的 Changelog，執行指令建立 Release：
     `gh release create <版本號> --title "<版本號>" --notes "<Changelog 內容>"`
   - 若未安裝或未登入：
     停止後續動作，並提示使用者：「請先安裝 GitHub CLI（gh）並執行 `gh auth login` 完成登入後，再重新執行指令。」
