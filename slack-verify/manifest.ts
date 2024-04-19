import { Manifest } from "deno-slack-sdk/mod.ts";
import ConfigureEvaWorkflow from "./workflows/configure_eva.ts";
import EvaVerifyWorkflow from "./workflows/eva_verify.ts";
import EvaTimeoutWorkflow from "./workflows/eva_timeout.ts";
import EvaConfigurationDatastore from "./datastores/eva_configuration.ts";
import EvaSessionDatastore from "./datastores/eva_session.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "EVA",
  description: "Employee Verify App",
  icon: "assets/default_new_app_icon.png",
  workflows: [EvaVerifyWorkflow, ConfigureEvaWorkflow, EvaTimeoutWorkflow],
  outgoingDomains: [],
  datastores: [EvaConfigurationDatastore, EvaSessionDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "groups:write",
    "users.profile:read",
    "triggers:write",
  ],
});
