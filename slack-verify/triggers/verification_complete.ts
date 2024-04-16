
import { Trigger } from "deno-slack-api/types.ts";
import { VerificationWorkflow } from "../workflows/verification_workflow.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";

const trigger: Trigger<typeof VerificationWorkflow.definition> = {
  type: TriggerTypes.Webhook,
  name: "Okta Verification callback",
  description: "Checks if the user has been verified by Okta",
  // "myWorkflow" must be a valid callback_id of a workflow
  workflow: "#/workflows/verification_workflow",
  inputs: {
    sender: {
      value: "{{data.sender}}",
    },
    verifier: {
      value: "{{data.verifier}}",
    },
  },
};

export default trigger;

