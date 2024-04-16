import { Manifest } from "deno-slack-sdk/mod.ts";
import ConfigureEvaWorkflow from "./workflows/configure_eva.ts";
import EvaVerifyWorkflow from "./workflows/eva_verify.ts";
import EvaConfigurationDatastore from "./datastores/eva_configuration.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "EVA",
  description: "Employee Verify App",
  icon: "assets/default_new_app_icon.png",
  workflows: [EvaVerifyWorkflow, ConfigureEvaWorkflow],
  outgoingDomains: [],
  datastores: [EvaConfigurationDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "groups:write",
    "users.profile:read",
  ],
});
