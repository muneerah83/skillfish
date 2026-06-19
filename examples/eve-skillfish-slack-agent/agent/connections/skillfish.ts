import { defineMcpClientConnection } from "eve/connections";

// ONE connection -> the skillfish MCP gateway.
//
// The gateway fans out to whatever MCP tools you have enabled for this token on
// your skillfish dashboard. That means you add or remove the agent's tools
// SERVER-SIDE, per token, with NO redeploy of the agent.
//
// `SKILLFISH_MCP_TOKEN` is collected at deploy time by the "Deploy with Vercel"
// button (the `env` param in the README's deploy URL). eve resolves it via
// `getToken`, sends it as `Authorization: Bearer <token>` on each request, and
// the model never sees the URL or the token.
export default defineMcpClientConnection({
  url: process.env.SKILLFISH_MCP_URL ?? "https://gateway.skill.fish/mcp",
  description:
    "skillfish MCP gateway: every MCP tool enabled for this workspace's token.",
  auth: {
    getToken: async () => ({ token: process.env.SKILLFISH_MCP_TOKEN! }),
  },
});
