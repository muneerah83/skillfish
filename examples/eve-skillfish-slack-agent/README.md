# eve + skillfish — one-click Slack agent

A minimal [eve](https://eve.dev) agent you can deploy to Vercel in one click. It
gives a user a working **Slack** bot whose tools come from **one skillfish MCP
gateway connection** — so you can add or remove the agent's tools server-side,
per token, without redeploying.

This is a reference/prototype for how a skillfish "spin up an agent" flow could
emit a deployable eve project.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fknoxgraeme%2Fskillfish%2Ftree%2Fclaude%2Fclever-clarke-exfiqt%2Fexamples%2Feve-skillfish-slack-agent&env=SKILLFISH_MCP_TOKEN&envDescription=Your%20skillfish%20MCP%20gateway%20token%20%28adds%20MCP%20tools%20to%20your%20agent%29&envLink=https%3A%2F%2Fskill.fish&project-name=skillfish-slack-agent&repository-name=skillfish-slack-agent&connect=%5B%7B%22type%22%3A%22slack%22%2C%22env%22%3A%22SLACK_CONNECTOR%22%2C%22triggers%22%3Atrue%2C%22triggerPath%22%3A%22%2Feve%2Fv1%2Fslack%22%7D%5D)

### What the deploy button does

The button drives Vercel's project-creation flow. Each query param maps to one
prompt:

| Param | Decoded value | Effect |
| --- | --- | --- |
| `repository-url` | this folder | Clones it into the user's GitHub/GitLab/Bitbucket. |
| `env` | `SKILLFISH_MCP_TOKEN` | **Prompts the user to paste their skillfish MCP token** — this is the "pass an API key in the one-click deploy" piece. |
| `envDescription` / `envLink` | help text + link | Explains where to get the token (points at `skill.fish`). |
| `connect` | `[{"type":"slack","env":"SLACK_CONNECTOR","triggers":true,"triggerPath":"/eve/v1/slack"}]` | **Provisions a Vercel-managed Slack connector**, writes its UID to `SLACK_CONNECTOR`, and wires Slack events to the `/eve/v1/slack` trigger path. This is the "connect a channel" piece. |

So the end-user flow is roughly: **click Deploy → paste skillfish token → authorize
Slack (OAuth consent) → message the bot.** AI Gateway needs no key (OIDC on
Vercel + free monthly credits), so the only real interaction is the one Slack
consent screen.

> The `repository-url` above points at this branch/subdirectory so it is
> accurate today. For a production button, move this folder to its own public
> repo (or `main`) and update `repository-url` to match.

## How it works (three independent wires)

| Want | File | Auth |
| --- | --- | --- |
| Tools (MCP) | [`agent/connections/skillfish.ts`](./agent/connections/skillfish.ts) | `SKILLFISH_MCP_TOKEN` as a bearer token to your gateway |
| Slack surface | [`agent/channels/slack.ts`](./agent/channels/slack.ts) | `SLACK_CONNECTOR` (Vercel-managed Slack connector) |
| Skills | [`agent/skills/`](./agent/skills/) | none — just markdown files |

Note the gateway (a *connection* = tools the agent calls) and Slack (a *channel*
= the surface it talks on) are separate slots. Adding the gateway does **not**
give you Slack, and vice-versa.

### Adding MCP tools without redeploying

The agent holds **one** connection — your gateway — authenticated with the
user's `SKILLFISH_MCP_TOKEN`. eve discovers whatever tools the gateway exposes
for that token at runtime. So to give every deployed agent a new tool, you
enable it on the skillfish side for that token; no redeploy, no code change in
the agent.

## Local development

```bash
npm install                     # or: pnpm install
cp .env.example .env            # fill in SKILLFISH_MCP_TOKEN (+ SLACK_CONNECTOR)
npm run dev                     # eve dev — interactive terminal + session API
```

The same session API runs locally and in production:

```bash
curl -X POST http://127.0.0.1:3000/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"what tools do you have?"}'
```

## Notes / caveats

- eve, Vercel Connect, and the eve connection/channel APIs are in **public beta**
  (eve `0.11.x`). Pin versions and expect some churn before GA. If a dependency
  version here drifts, scaffold a fresh project with `npx eve@latest init` and
  copy these three files (`connections/skillfish.ts`, `channels/slack.ts`, and
  this deploy button) into it — those are the only skillfish-specific parts.
- The gateway pattern means **you** broker the downstream tool credentials
  (whatever the MCP tools touch). That is a security/compliance responsibility
  to design carefully (per-token scoping, rotation, revocation).
- Replace `https://gateway.skill.fish/mcp` and the `skill.fish` token link with
  your real gateway URL and dashboard route.
