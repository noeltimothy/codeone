import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
const EvaConfigurationDatastore = DefineDatastore({
  name: "eva-config",
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
    logo: {
      type: Schema.types.string,
    },
    request_message: {
      type: Schema.types.string,
    },
    response_message: {
      type: Schema.types.string,
    },
    timeout: {
      type: Schema.types.number,
    },
  },
});

export default EvaConfigurationDatastore;
