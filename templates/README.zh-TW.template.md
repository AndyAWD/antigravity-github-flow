# {{PROJECT_NAME}}

[English](README.md) | 繁體中文

{{PROJECT_DESCRIPTION}}

全面支援 Google Antigravity（AGY）的三大核心平台：Antigravity 命令列介面（Command-Line Interface / CLI）（`agy`）、Antigravity 整合開發環境（Integrated Development Environment / IDE）以及 Antigravity 2.0 桌面應用程式。

## 如何安裝

透過 Antigravity 命令列介面（CLI）進行全域安裝：

```bash
agy plugin install {{GITHUB_REPO_URL}}
```

## 特色亮點

1. **全平台無縫相容**：完美相容於 CLI 終端機、IDE 側邊欄對話框以及 2.0 桌面版的對話畫布（Chat Canvas）。
2. **{{FEATURE_1_TITLE}}**：{{FEATURE_1_DESCRIPTION}}
3. **{{FEATURE_2_TITLE}}**：{{FEATURE_2_DESCRIPTION}}
4. **{{FEATURE_3_TITLE}}**：{{FEATURE_3_DESCRIPTION}}

## 如何管理與切換外掛程式

• 列出已安裝外掛：

  ```bash
  agy plugin list
  ```

• 啟用外掛：

  ```bash
  agy plugin enable {{PROJECT_NAME}}
  ```

• 停用外掛：

  ```bash
  agy plugin disable {{PROJECT_NAME}}
  ```

• 移除外掛：

  ```bash
  agy plugin uninstall {{PROJECT_NAME}}
  ```

> 在 Antigravity 2.0 左側欄的 **Skills & Customizations** 面板中，亦可即時檢視外掛載入狀態。

## 專案資料夾目錄

```text
{{PROJECT_NAME}}/
├── plugin.json
├── package.json
├── LICENSE
├── README.md
├── README.zh-TW.md
└── skills/
    └── {{PRIMARY_SKILL_NAME}}/
        └── SKILL.md
```

## 指令功能說明

安裝完成後，可在任何 AGY 介面透過語意對話或輸入對應的斜線指令（Slash Command）觸發：

### 1. {{COMMAND_1_NAME}}

```text
/{{PROJECT_NAME}}:{{COMMAND_1_SKILL_PATH}}
```

- **使用情境**：{{COMMAND_1_WHEN_TO_USE}}
- **運作流程**：
  1. {{COMMAND_1_STEP_1}}
  2. {{COMMAND_1_STEP_2}}
  3. {{COMMAND_1_STEP_3}}
- **參數與範例**（選用）：
```text
/{{PROJECT_NAME}}:{{COMMAND_1_SKILL_PATH}} [參數]
```

### 2. {{COMMAND_2_NAME}}

```text
/{{PROJECT_NAME}}:{{COMMAND_2_SKILL_PATH}}
```

- **使用情境**：{{COMMAND_2_WHEN_TO_USE}}
- **運作流程**：
  1. {{COMMAND_2_STEP_1}}
  2. {{COMMAND_2_STEP_2}}
- **參數與範例**（選用）：
```text
/{{PROJECT_NAME}}:{{COMMAND_2_SKILL_PATH}} [參數]
```

## 授權條款

本專案採用 MIT 授權條款釋出，詳情請參閱 [LICENSE](LICENSE) 檔案。
