import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { timeout_fn as EvaTimeout } from "../functions/eva_timeout.ts";

const EvaTimeoutWorkflow = DefineWorkflow({
  callback_id: "eva-timeout-workflow",
  title: "EVA Timeout Workflow",
  input_parameters: {
	  properties: {
		  verifier_target: { type: Schema.types.string },
	  },
	  required: [],
  },
});

EvaTimeoutWorkflow.addStep(EvaTimeout, {verifier_target: EvaTimeoutWorkflow.inputs.verifier_target});

export default EvaTimeoutWorkflow;
