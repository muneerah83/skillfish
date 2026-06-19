import { defineAgent } from "eve";

// The model string is routed through Vercel AI Gateway, so you can swap
// providers without touching credentials. On Vercel, auth is handled by the
// deployment's OIDC identity — no API key to paste. Locally, eve falls back to
// an AI Gateway API key (the free monthly credits cover trying it out).
export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
});
