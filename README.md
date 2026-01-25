<p align="center">
  <img src="https://raw.githubusercontent.com/knoxgraeme/skillfish/main/assets/logo.png" alt="skillfish" width="600">
</p>

<p align="center">
  <a href="https://npmjs.com/package/skillfish"><img src="https://img.shields.io/npm/v/skillfish" alt="npm"></a>
  <a href="https://npmjs.com/package/skillfish"><img src="https://img.shields.io/npm/dm/skillfish" alt="downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/skillfish" alt="license"></a>
  <a href="package.json"><img src="https://img.shields.io/node/v/skillfish" alt="node"></a>
  <a href="https://github.com/knoxgraeme/skillfish/actions"><img src="https://github.com/knoxgraeme/skillfish/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<p align="center">
  <strong>The skill manager for AI coding agents.</strong><br>
  Install, update, and sync skills across Claude Code, Cursor, Copilot + more.
</p>

---

## Quick Start

```bash
npx skillfish add owner/repo
```

One command installs to **all detected agents** on your system.

## Commands

| Command | Description |
|---------|-------------|
| `skillfish add <repo>` | Install skills |
| `skillfish list` | View installed skills |
| `skillfish remove [name]` | Remove skills |
| `skillfish update [name]` | Update installed skills |

## Examples

```bash
npx skillfish add user/my-skill          # Install a skill
npx skillfish add owner/repo --all       # Install all skills from repo
npx skillfish list                       # See what's installed
npx skillfish update                     # Update all skills
npx skillfish remove old-skill           # Remove a skill
```

---

## Supported Agents

Works with [17 agents](#agent-directories) including:

**Claude Code** · **Cursor** · **Windsurf** · **Codex** · **GitHub Copilot** · **Gemini CLI** · **OpenCode** · **Goose** · **Amp** · **Roo Code** · **Kiro CLI** · **Kilo Code** · **Trae** · **Cline** · **Antigravity** · **Droid** · **Clawdbot**

---

## Command Reference

### add

Install skills from a repository.

```bash
npx skillfish add owner/repo                    # Auto-discover SKILL.md
npx skillfish add owner/repo/path/to/skill      # Full path syntax
npx skillfish add owner/repo --path skills/foo  # Explicit path
npx skillfish add owner/repo --all              # Install all skills
npx skillfish add owner/repo --force            # Overwrite existing
npx skillfish add owner/repo --yes              # Skip confirmation
npx skillfish add owner/repo --json             # JSON output
```

### list

View installed skills.

```bash
npx skillfish list                       # Interactive picker
npx skillfish list --global              # Global skills only (~/)
npx skillfish list --project             # Project skills only (./)
npx skillfish list --agent "Claude Code" # Specific agent
```

### remove

Remove installed skills.

```bash
npx skillfish remove                          # Interactive picker
npx skillfish remove my-skill                 # By name
npx skillfish remove --all                    # Remove all
npx skillfish remove my-skill --project       # Project only
npx skillfish remove my-skill --global        # Global only
npx skillfish remove my-skill --agent "Cursor" # Specific agent
npx skillfish remove my-skill --yes           # Skip confirmation
```

### update

Update installed skills to latest version.

```bash
npx skillfish update                     # Update all skills
npx skillfish update my-skill            # Update specific skill
npx skillfish update --yes               # Skip confirmation
```

---

## Interactive Selection

When a repo contains multiple skills, you'll get an interactive picker:

```
◆  Select skills to install
│  ◻ my-skill - A helpful skill for your AI agent
│  ◻ another-skill - Another useful capability
│  ◻ third-skill - Yet another skill option
└
```

Use `--all` to install all skills non-interactively.

---

## Agent Directories

| Agent | Skills Directory |
|-------|------------------|
| Claude Code | `~/.claude/skills/` |
| Cursor | `~/.cursor/skills/` |
| Windsurf | `~/.codeium/windsurf/skills/` |
| Codex | `~/.codex/skills/` |
| GitHub Copilot | `~/.github/skills/` |
| Gemini CLI | `~/.gemini/skills/` |
| OpenCode | `~/.opencode/skills/` |
| Goose | `~/.goose/skills/` |
| Amp | `~/.agents/skills/` |
| Roo Code | `~/.roo/skills/` |
| Kiro CLI | `~/.kiro/skills/` |
| Kilo Code | `~/.kilocode/skills/` |
| Trae | `~/.trae/skills/` |
| Cline | `~/.cline/skills/` |
| Antigravity | `~/.gemini/antigravity/skills/` |
| Droid | `~/.factory/skills/` |
| Clawdbot | `~/.clawdbot/skills/` |

---

## Skill Discovery

The CLI auto-discovers `SKILL.md` in these locations:

1. Repository root
2. `.claude/skills/{repo}/`
3. `skills/{repo}/`
4. `plugins/{repo}/skills/{repo}/`

Use `--path` to specify an exact location.

## Telemetry

This CLI collects anonymous, aggregate install counts to understand skill popularity. No personally identifiable information is collected.

**What is collected:**
- Skill identifier (e.g., `owner/repo/skill-name`)
- Incremented install count

**What is NOT collected:**
- IP addresses
- User identifiers
- System information
- Usage patterns

To opt out, set `DO_NOT_TRACK=1` in your environment:

```bash
DO_NOT_TRACK=1 npx skillfish add owner/repo
```

Telemetry is also automatically disabled in CI environments (`CI=true`).

## Exit Codes

Exit codes help agents and scripts understand command results without parsing error messages.

| Code | Name | Meaning |
|------|------|---------|
| 0 | Success | Command completed successfully |
| 1 | General Error | Unspecified error |
| 2 | Invalid Args | Invalid arguments or options provided |
| 3 | Network Error | Network failure (timeout, rate limit) |
| 4 | Not Found | Requested resource not found (skill, agent, repo) |

JSON output includes `exit_code` for programmatic access:

```bash
skillfish add owner/repo --json
# Output includes: "exit_code": 0 (or error code)
```

## Security

**Security Note:** Skills are markdown files that provide instructions to AI agents. Always review skills before installing. skillfish does not vet third-party skills.

To report security vulnerabilities, please email security@skill.fish. See [SECURITY.md](SECURITY.md) for details.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

[AGPL-3.0](LICENSE) - Graeme Knox
