# {{PROJECT_NAME}}

English | [繁體中文](README.zh-TW.md)

{{PROJECT_DESCRIPTION}}

Comprehensive support across the three core platforms of Google Antigravity (AGY): Antigravity Command-Line Interface (CLI) (`agy`), Antigravity Integrated Development Environment (IDE), and Antigravity 2.0 Desktop Application.

## Installation

Install the plugin globally using the Antigravity Command-Line Interface (CLI):

```bash
agy plugin install {{GITHUB_REPO_URL}}
```

## Key Features

1. **Seamless Cross-Platform Compatibility**: Fully compatible with Antigravity CLI terminal, IDE sidebar chat, and Antigravity 2.0 Chat Canvas.
2. **{{FEATURE_1_TITLE}}**: {{FEATURE_1_DESCRIPTION}}
3. **{{FEATURE_2_TITLE}}**: {{FEATURE_2_DESCRIPTION}}
4. **{{FEATURE_3_TITLE}}**: {{FEATURE_3_DESCRIPTION}}

## Plugin Management

• List installed plugins:

  ```bash
  agy plugin list
  ```

• Enable this plugin:

  ```bash
  agy plugin enable {{PROJECT_NAME}}
  ```

• Disable this plugin:

  ```bash
  agy plugin disable {{PROJECT_NAME}}
  ```

• Uninstall this plugin:

  ```bash
  agy plugin uninstall {{PROJECT_NAME}}
  ```

> In Antigravity 2.0, you can also inspect and verify the real-time loading status in the **Skills & Customizations** panel in the left sidebar.

## Directory Structure

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

## Commands and Skills

Once installed, trigger capabilities using natural language prompts or dedicated slash commands:

### 1. {{COMMAND_1_NAME}}

```text
/{{PROJECT_NAME}}:{{COMMAND_1_SKILL_PATH}}
```

- **When to Use**: {{COMMAND_1_WHEN_TO_USE}}
- **How It Works**:
  1. {{COMMAND_1_STEP_1}}
  2. {{COMMAND_1_STEP_2}}
  3. {{COMMAND_1_STEP_3}}
- **Parameters / Examples** (optional):
```text
/{{PROJECT_NAME}}:{{COMMAND_1_SKILL_PATH}} [options]
```

### 2. {{COMMAND_2_NAME}}

```text
/{{PROJECT_NAME}}:{{COMMAND_2_SKILL_PATH}}
```

- **When to Use**: {{COMMAND_2_WHEN_TO_USE}}
- **How It Works**:
  1. {{COMMAND_2_STEP_1}}
  2. {{COMMAND_2_STEP_2}}
- **Parameters / Examples** (optional):
```text
/{{PROJECT_NAME}}:{{COMMAND_2_SKILL_PATH}} [options]
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
