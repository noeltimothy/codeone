import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { eva_verify_fn as EvaVerify } from "../functions/eva_verify.ts";
import { timeout_fn as EvaTimeout } from "../functions/eva_timeout.ts";

const EvaVerifyWorkflow = DefineWorkflow({
  callback_id: "eva-verify-workflow",
  title: "EVA Verify Workflow",
  input_parameters: {
    properties: { interactivity: { type: Schema.slack.types.interactivity } },
    required: ["interactivity"],
  },
});

EvaVerifyWorkflow.addStep(EvaVerify, { interactivity: EvaVerifyWorkflow.inputs.interactivity });

export default EvaVerifyWorkflow;
