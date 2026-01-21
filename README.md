# skill-fish-cli

Install AI agent skills from GitHub with a single command.

```bash
npx skill-fish-cli owner/repo
```

## Overview

One command installs skills to **all detected agents**:
- Claude Code (`~/.claude/skills/`)
- Cursor (`~/.cursor/skills/`)
- Windsurf (`~/.codeium/windsurf/skills/`)
- Cline (`~/.cline/skills/`)
- Codex (`~/.codex/skills/`)
- Copilot (`~/.copilot/skills/`)

## Usage

```bash
# Auto-discover skill location (interactive if multiple found)
npx skill-fish-cli owner/repo

# Full path format (from skills.sh database)
npx skill-fish-cli owner/repo/plugin/skill

# Specify explicit path
npx skill-fish-cli owner/repo --path path/to/skill

# Overwrite existing skills
npx skill-fish-cli owner/repo --force
```

## Interactive Selection

When a repo contains multiple skills, you'll get an interactive menu:

```
Found 15 skills in this repository:

  1) coding-tutor
  2) agent-browser
  3) agent-native-architecture
  ...

Select skill (1-15):
```

## Examples

```bash
# Install from a skill repo with SKILL.md at root
npx skill-fish-cli user/my-skill

# Install using full path from skills.sh
npx skill-fish-cli EveryInc/compound-engineering-plugin/compound-engineering/frontend-design

# Install from a plugin repo with explicit path
npx skill-fish-cli org/plugin-repo --path plugins/my-plugin/skills/skill-name

# Force reinstall
npx skill-fish-cli user/skill --force
```

## Private Repos

Set `GITHUB_TOKEN` or `GH_TOKEN` environment variable:

```bash
GITHUB_TOKEN=ghp_xxx npx skill-fish-cli private-org/private-repo
```

## Discovery

The CLI searches these locations for `SKILL.md`:
1. Repository root
2. `.claude/skills/{repo}/`
3. `skills/{repo}/`
4. `plugins/{repo}/skills/{repo}/`

Use `--path` to skip discovery and specify the exact location.

## Aliases

Both commands work:
- `npx skill-fish-cli` (primary)
- `npx install-skill` (alias)

## License

MIT
