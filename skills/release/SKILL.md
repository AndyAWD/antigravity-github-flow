---
name: agy-github-flow:release
description: 依照 GitHub Flow 規範建立發布準備分支，並具備跨平台智慧版號更新能力（支援 package.json, build.gradle 等多種格式）。當使用者輸入 /agy-github-flow:release 時觸發。
---

# 建立發布準備分支（Start Release）

本技能旨在為 GitHub Flow 的發布準備階段建立 `release/<版號>` 分支，並透過 AI 智能搜尋專案中的版號定義檔進行自動更新。

## 什麼時候觸發此技能？

1. 當使用者輸入 `/agy-github-flow:release [vX.Y.Z]`。
2. 當使用者要求「開啟發布分支」、「準備 release」、「更新版本號」時。

## 執行的實作步驟

重要提示：關於腳本執行路徑，由於本技能作為 Plugin 載入，請從您的系統提示詞 `<skills>` 列表中，找出 `agy-github-flow:commit`（或 `commit`）技能被載入的絕對路徑（位於括號中）。請解析該絕對目錄位置，並替換為 `scripts/commit.js` 執行提交腳本，絕不可使用相對路徑。

### 步驟 0：工作區狀態檢查（防越界機制）

1. 執行 `git status --porcelain` 檢查工作區是否乾淨。
2. 若偵測到有未暫存、已暫存或未追蹤的檔案（工作區非乾淨狀態）：
   - **必須立即中止流程**，嚴格禁止在工作區非乾淨狀態下開啟發布分支或切換分支，亦嚴格禁止詢問使用者是否代為提交。
   - 明確提示使用者：「偵測到工作區尚有未提交的變更。開啟發布分支前工作區必須保持乾淨，避免既有變更污染發布分支或被誤入版號提交。請先使用 `/agy-github-flow:commit` 完成正規提交流程後再開啟發布分支。」

### 步驟 1：防呆機制與狀態同步

1. 若專案設定有遠端儲存庫（`git remote`），先執行 `git fetch --all --tags --prune` 確保本機擁有遠端所有的標籤（Tags）與分支資訊。
2. 執行 `git branch --show-current` 確認當前分支。若當前分支不是 `main`（或 `master`），**必須立即中止流程**並提示使用者：「開啟 Release 分支必須由 main 主分支建立，請先切換至 main 分支。」嚴禁詢問代為提交或代為切換分支。
3. 若遠端存在 `origin/main`，先執行 `git pull --ff-only` 確保主分支處於最新狀態。

### 步驟 2：判斷與確認版號

1. 若使用者在指令中指定了版號（如 `/agy-github-flow:release v1.2.0`），則直接使用該版號。
2. 若無指定，使用 `git log` 分析自上一個 Tag 以來的新功能與修復，推算下一個合理的語意化版本（SemVer: vX.Y.Z）版號。

### 步驟 3：建立發布分支

執行 `git checkout -b release/<版號>`。

### 步驟 4：跨平台版號智慧更新（Agentic Version Bumping）

發揮跨語言優勢，檢查專案目錄尋找常見的版號定義檔：
- Node.js：若發現 `package.json`，執行 `npm version <新版號> --no-git-tag-version`。
- Android：若發現 `build.gradle` 或 `build.gradle.kts`，找出 `versionName` 屬性並更新。
- Python：若發現 `pyproject.toml` 或 `setup.py`，找出 `version` 屬性並更新。
- iOS / macOS：若發現 `Info.plist` 或 `project.pbxproj` 且確定版號位置，進行更新。
- 若無法確定或找不到版號檔：使用 `ask_question` 工具詢問使用者是否需要協助更新特定檔案內的版號。

### 步驟 5：提交版號變更

1. 若有版號檔案被更新：
   - **精準暫存**：僅針對實際修改之版號檔案執行 `git add <版號檔案>`（例如 `git add package.json`），**嚴格禁止使用 `git add -A` 或 `git add .`**。
   - **正規提交**：**必須透過 commit 技能之腳本執行提交**：
     ```bash
     node <commit技能絕對目錄>/scripts/commit.js "chore(release): bump version to <版號>"
     ```
     （該腳本會自動注入官方共同作者簽名 `Co-authored-by: Google Antigravity <242056456+google-antigravity@users.noreply.github.com>`）。
   - **嚴格禁止執行原生 `git commit` 指令**。
2. 若無檔案更新，告知使用者「發布分支建立完畢，未偵測到需要自動更新的版號檔案」。

## 嚴格禁止事項（Anti-patterns）

1. **嚴格禁止執行原生 `git commit` 指令**：提交版號變更必須統一透過 `scripts/commit.js` 執行，以確保官方共同作者簽名與格式正確無誤。
2. **嚴格禁止跨技能越界代理提交**：若工作區在開啟發布分支前不乾淨，嚴格禁止代為提交既有變更，必須中斷並指引使用者執行 `/agy-github-flow:commit`。
3. **嚴格禁止無差別全量暫存（`git add -A`）**：提交版號時僅允許精準暫存版號定義檔，禁止將未預期的檔案納入發布提交中。
