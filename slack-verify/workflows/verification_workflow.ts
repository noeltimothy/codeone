
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

// Workflow definition
export const VerificationWorkflow = DefineWorkflow({
  callback_id: "verification_workflow",
  title: "Verification Workflow",
  input_parameters: {
    properties: {
      sender: {
        type: Schema.slack.types.user_id,
        description: "user id.",
      },
      verifier: {
        type: Schema.slack.types.user_id,
        description: "user id.",
      },
    },
    required: ["state", "code"],
  },
});

VerificationWorkflow.addStep(
    Schema.slack.functions.SendDm,{
        user_id: VerificationWorkflow.inputs.sender, //conversionStep.outputs.sender,
        message: "<@" +VerificationWorkflow.inputs.verifier + "> has been verified successfully",
    }
);

export default VerificationWorkflow;
