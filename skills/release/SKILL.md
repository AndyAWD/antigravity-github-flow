---
name: antigravity-github-flow:github-flow:release
description: 依照 GitHub Flow 規範建立發布準備分支，並具備跨平台智慧版號更新能力（支援 package.json, build.gradle 等多種格式）。當使用者輸入 /antigravity-github-flow:github-flow:release 時觸發。
---

# 建立發布準備分支（Start Release）

本技能旨在為 GitHub Flow 的發布準備階段建立 `release/<版號>` 分支，並透過 AI 智能搜尋專案中的版號定義檔進行自動更新。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/antigravity-github-flow:github-flow:release [vX.Y.Z]`。
2. 當使用者要求「開啟發布分支」、「準備 release」、「更新版本號」時。

## 執行的實作步驟

1. 第一步：防呆機制與狀態同步
   - 若專案設定有遠端儲存庫（`git remote`），先執行 `git fetch --all --tags --prune` 確保本機擁有遠端所有的標籤（Tags）與分支資訊。
   - 執行 `git branch --show-current` 確認當前分支。建議在 `main` 主分支上發起，若在其他分支則提醒使用者。
   - 若遠端存在 `origin/main`，先執行 `git pull --ff-only` 確保主分支處於最新狀態。

2. 第二步：判斷與確認版號
   - 若使用者在指令中指定了版號（如 `/antigravity-github-flow:github-flow:release v1.2.0`），則直接使用該版號。
   - 若無指定，使用 `git log` 分析自上一個 Tag 以來的新功能與修復，推算下一個合理的語意化版本（SemVer: vX.Y.Z）版號。

3. 第三步：建立發布分支
   執行 `git checkout -b release/<版號>`。

4. 第四步：跨平台版號智慧更新（Agentic Version Bumping）
   發揮跨語言優勢，檢查專案目錄尋找常見的版號定義檔：
   - Node.js：若發現 `package.json`，執行 `npm version <新版號> --no-git-tag-version`。
   - Android：若發現 `build.gradle` 或 `build.gradle.kts`，找出 `versionName` 屬性並更新。
   - Python：若發現 `pyproject.toml` 或 `setup.py`，找出 `version` 屬性並更新。
   - iOS / macOS：若發現 `Info.plist` 或 `project.pbxproj` 且確定版號位置，進行更新。
   - 若無法確定或找不到版號檔：使用 `ask_question` 工具詢問使用者是否需要協助更新特定檔案內的版號。

5. 第五步：提交版號變更
   - 若有版號檔案被更新，執行 `git add -A`，並以 `chore(release): bump version to <版號>` 提交，最下方附上 `Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>` 簽名。
   - 若無檔案更新，告知使用者「發布分支建立完畢，未偵測到需要自動更新的版號檔案」。
