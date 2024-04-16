import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { configure_eva_fn as ConfigureEva } from "../functions/configure_eva.ts";

const ConfigureEvaWorkflow = DefineWorkflow({
  callback_id: "configure-eva-workflow",
  title: "Configure EVA Workflow",
  input_parameters: {
    properties: { interactivity: { type: Schema.slack.types.interactivity } },
    required: ["interactivity"],
  },
});

ConfigureEvaWorkflow.addStep(ConfigureEva, { interactivity: ConfigureEvaWorkflow.inputs.interactivity });

export default ConfigureEvaWorkflow;
