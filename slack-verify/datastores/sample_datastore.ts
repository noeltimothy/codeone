import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
const SampleObjectDatastore = DefineDatastore({
  name: "EVA",
  primary_key: "team_id",
  attributes: {
    team_id: {
      type: Schema.types.string,
    },
    domain: {
      type: Schema.types.string,
    },
    key: {
      type: Schema.types.string,
    },
    message: {
      type: Schema.types.string,
    },
  },
});

export default SampleObjectDatastore;
