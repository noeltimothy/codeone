import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import VerifyMeWorkflow from "../workflows/verifyme_workflow.ts";
/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const startVerifyTrigger: Trigger<typeof VerifyMeWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Verify Caller",
  description: "Sends a verification request to the caller",
  workflow: "#/workflows/verifyme_workflow",
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default startVerifyTrigger;
