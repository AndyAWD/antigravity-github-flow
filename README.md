# antigravity-github-flow

English | [繁體中文](README.zh-TW.md)

An Antigravity plugin for Google Antigravity (AGY), providing a streamlined, agile, and automated GitHub Flow pipeline.

Comprehensive support across the three core platforms of Google Antigravity: Antigravity Command-Line Interface (CLI) (`agy`), Antigravity Integrated Development Environment (IDE), and Antigravity 2.0 Desktop Application.

This plugin automatically produces precise Git commits following the Conventional Commits v1.0.0 specification, centered around a single `main` branch, orchestrating branch creation, Pull Request (PR) publication, bilingual GitHub Release notes, and automated bilingual documentation generation.

## Installation

Install the plugin globally using the Antigravity Command-Line Interface (CLI):

```bash
agy plugin install https://github.com/AndyAWD/antigravity-github-flow
```

## Key Features

1. **Seamless Cross-Platform Compatibility**: Fully compatible with Antigravity CLI terminal, IDE sidebar chat, and Antigravity 2.0 Chat Canvas.
2. **Auto Navigation & Flow Progression**: Designed for developers of all skill levels, AI automatically analyzes project state and advances to the next logical GitHub Flow step.
3. **Strict Conventional Commits Compliance**: Built-in prompt rules ensure consistent `<type>[scope]: <description>` structure and eliminate model hallucinations.
4. **Multi-Task Auto Splitting**: Automatically splits unrelated working tree changes into separate logical commits.
5. **Streamlined Single-Trunk Model**: Centered around `main`; feature, bugfix, or release branches branch off `main` and merge back cleanly via PR or local merge.
6. **Standardized Bilingual Documentation & Releases**: Integrated multi-language PR templates, bilingual GitHub Release changelogs, and automated README generation.
7. **Dedicated Co-Author Attribution**: Every automated commit includes Google Antigravity co-author attribution.

## Plugin Management

  • List installed plugins:
    ```bash
    agy plugin list
    ```

  • Enable this plugin:
    ```bash
    agy plugin enable antigravity-github-flow
    ```

  • Disable this plugin:
    ```bash
    agy plugin disable antigravity-github-flow
    ```

  • Uninstall this plugin:
    ```bash
    agy plugin uninstall antigravity-github-flow
    ```

> In Antigravity 2.0, you can also inspect and verify real-time loading status in the **Skills & Customizations** panel in the left sidebar.

## Directory Structure

```text
antigravity-github-flow/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── plugin.json
├── package.json
├── LICENSE
├── README.md
├── README.zh-TW.md
├── templates/
│   ├── README.template.md
│   ├── README.zh-TW.template.md
│   ├── RELEASE.template.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── PULL_REQUEST_TEMPLATE.en.md
│   └── PULL_REQUEST_TEMPLATE.bilingual.md
└── skills/
    ├── auto-next/
    ├── commit/
    ├── fetch/
    ├── github-pr/
    ├── github-release/
    ├── init/
    ├── merge/
    ├── pull/
    ├── push/
    ├── release/
    ├── sync-readme/
    └── tag/
```

## Commands and Skills

Once installed, trigger capabilities using natural language prompts or dedicated slash commands:

### 1. Auto Navigation (Auto Next)

```text
/antigravity-github-flow:agy-github-flow:auto-next
```

- **When to Use**: When unsure of the next step, or wishing to automate the GitHub Flow progression.
- **How It Works**:
  1. Executes background remote fetch and safely fast-forwards non-current local branches.
  2. Verifies VCS initialization and `main` branch presence.
  3. Checks working tree changes and automatically commits and pushes.
  4. Automatically advances PR creation, merge, or release based on current working branch context.

### 2. Conventional Commits (Commit)

```text
/antigravity-github-flow:agy-github-flow:commit
```

- **When to Use**: When changes are ready to be committed to version history.
- **How It Works**:
  1. Stages changes and performs safety checks.
  2. Splits multi-task changes into discrete logical commits.
  3. Guides switching off `main` if on trunk, or commits directly if intended.
  4. Generates Conventional Commit messages with Google Antigravity co-author trailer.

### 3. Branch Merge (Merge)

```text
/antigravity-github-flow:agy-github-flow:merge
```

- **When to Use**: When feature or bugfix branch is complete and ready to merge into `main`.
- **How It Works**:
  1. Asks user preference between opening a GitHub PR or merging locally.
  2. For local merge, checks out `main`, syncs remote, and executes `--no-ff` merge.
  3. Prompts whether to delete the original working branch upon completion.

### 4. Open Pull Request (GitHub PR)

```text
/antigravity-github-flow:agy-github-flow:github-pr
```

- **When to Use**: When submitting a pull request to `main` for code review.
- **How It Works**:
  1. Verifies current branch is not `main` and is pushed to remote.
  2. Interactively asks for preferred PR language via `ask_question` (Traditional Chinese, English, or Bilingual).
  3. Analyzes commit diffs to extract purpose, summary, change type, and affected components (no emojis).
  4. Reviews PR and publishes via GitHub CLI (`gh pr create`).

### 5. Remote Push (Push)

```text
/antigravity-github-flow:agy-github-flow:push
```

- **When to Use**: When pushing local commits and tags to remote repository.
- **How It Works**:
  1. Runs fetch first to inspect remote state.
  2. Executes `git push -u origin HEAD --follow-tags` after confirming branch is up to date.

### 6. Remote Fetch (Fetch)

```text
/antigravity-github-flow:agy-github-flow:fetch
```

- **When to Use**: When fetching latest remote refs and fast-forwarding non-current local branches.
- **How It Works**:
  1. Runs `git fetch --all --prune --tags` to download remote objects.
  2. Safely fast-forwards all non-current local branches.
  3. Skips diverged branches without affecting current workspace.

### 7. Remote Pull (Pull)

```text
/antigravity-github-flow:agy-github-flow:pull
```

- **When to Use**: When synchronizing remote commits into current working branch.
- **How It Works**:
  1. Mandates preliminary fetch for global state synchronization.
  2. Performs safe fast-forward pull (`git pull --ff-only`).
  3. Provides `ask_question` interactive troubleshooting menu if dirty or diverged.

### 8. Release Branch (Release)

```text
/antigravity-github-flow:agy-github-flow:release [vX.Y.Z]
```

- **When to Use**: When preparing a new release and bumping version numbers.
- **How It Works**:
  1. Calculates SemVer version bump from commit history.
  2. Creates and checks out `release/<version>` branch from `main`.
  3. Updates version strings across project manifests (`package.json`, etc.) and commits.

### 9. Version Tag (Tag)

```text
/antigravity-github-flow:agy-github-flow:tag [vX.Y.Z]
```

- **When to Use**: When tagging a released commit on `main`.
- **How It Works**:
  1. Restricts execution strictly to `main` or `master`.
  2. Determines next version tag according to SemVer rules.
  3. Tags commit with `vX.Y.Z` and assists in remote push.

### 10. GitHub Release (Release Notes)

```text
/antigravity-github-flow:agy-github-flow:github-release
```

- **When to Use**: When creating an official release on GitHub.
- **How It Works**:
  1. Confirms version tag and retrieves commits since previous tag.
  2. Categorizes changes by commit type and produces bilingual changelog (no emojis) with compare link.
  3. Reviews and publishes via GitHub CLI (`gh release create`).

### 11. Scaffolding Init (Init)

```text
/antigravity-github-flow:agy-github-flow:init
```

- **When to Use**: When scaffolding GitHub Flow single-trunk structure for a new repository.
- **How It Works**:
  1. Initializes git repository if needed.
  2. Creates initial commit.
  3. Ensures branch is named `main` and stays checked out.

### 12. Bilingual Documentation Sync (Sync Readme)

```text
/antigravity-github-flow:agy-github-flow:sync-readme
```

- **When to Use**: When creating, updating, or refactoring bilingual README files.
- **How It Works**:
  1. Inspects workspace structure, manifests, and `skills/` directory.
  2. Automatically identifies execution mode (Create, Update, or Refactor).
  3. Synchronizes symmetric `README.md` (English) and `README.zh-TW.md` (Traditional Chinese) adhering to standard specifications.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
