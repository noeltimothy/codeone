import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
const EvaSessionDatastore = DefineDatastore({
  name: "eva-sessions",
  primary_key: "verifier_target",
  attributes: {
    verifier_target: {
      type: Schema.types.string,
    },
    flag: {
      // pending or complete
      type: Schema.types.string,
    },
  },
});

export default EvaSessionDatastore;
