import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

// This file IS the Slack surface. eve exposes it at the trigger path
// `/eve/v1/slack`, which Slack POSTs events to.
//
// `SLACK_CONNECTOR` is provisioned automatically by the "Deploy with Vercel"
// button (see the `connect` param in the README's deploy URL). To wire it up
// manually instead, run:
//
//   vercel connect create slack --triggers
//
// ...then put the connector UID in the SLACK_CONNECTOR env var. Vercel Connect
// brokers the OAuth + token refresh; the Slack app is Vercel-managed, so there
// is no Slack app to register and no client secret to manage.
export default slackChannel({
  credentials: connectSlackCredentials(
    process.env.SLACK_CONNECTOR ?? "slack/skillfish-agent",
  ),
});
