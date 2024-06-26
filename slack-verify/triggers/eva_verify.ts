
import { Trigger } from "deno-slack-sdk/types.ts";

/**
 * This trigger starts the workflow when an end-user clicks the link.
 * Learn more at https://api.slack.com/future/triggers/link
 */
const trigger: Trigger<typeof workflow.definition> = {
  type: "shortcut",
  name: "EVA Verify Trigger",
  workflow: "#/workflows/eva-verify-workflow",
  inputs: {
    // interactivity is necessary for opening a modal
    interactivity: { value: "{{data.interactivity}}" },
  },
};

// Note that the Trigger object must be default-exported
export default trigger;
