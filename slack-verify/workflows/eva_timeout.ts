import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { timeout_fn as EvaTimeout } from "../functions/eva_timeout.ts";

const EvaTimeoutWorkflow = DefineWorkflow({
  callback_id: "eva-timeout-workflow",
  title: "EVA Timeout Workflow",
  input_parameters: {
	  // TODO: Add verifier and target here.
	  properties: {},
	  required: [],
  },
});

EvaTimeoutWorkflow.addStep(EvaTimeout, {});

export default EvaTimeoutWorkflow;
