import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ReadConfiguration } from "../functions/read_configuration.ts";

const VerifyMeWorkflow = DefineWorkflow({
  callback_id: "verifyme_workflow",
  title: "Verify User",
  description: "Security Verification request",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user", "interactivity"],
  },
});

const inputForm = VerifyMeWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Verify User",
    interactivity: VerifyMeWorkflow.inputs.interactivity,
    submit_label: "Verify",
    fields: {
      elements: [{
        name: "user",
        title: "User to be verified",
        type: Schema.slack.types.user_id,
        default: VerifyMeWorkflow.inputs.user,
      },
      {
        name: "message",
        title: "Your custom verification message",
        type: Schema.types.string,
        long: true,
      }],
      required: ["user"],
    },
  },
);

const functionStep = VerifyMeWorkflow.addStep(ReadConfiguration, { 
  custom_message: inputForm.outputs.fields.message,
});

/**
 * SendMessage is a Slack function. These are
 * Slack-native actions, like creating a channel or sending
 * a message and can be used alongside custom functions in a workflow.
 * https://api.slack.com/automation/functions
 */
VerifyMeWorkflow.addStep(Schema.slack.functions.SendDm, {
  user_id: inputForm.outputs.fields.user,
  message: "Message from <@" + VerifyMeWorkflow.inputs.interactivity.interactor.id + ">: " + 
	  functionStep.outputs.updated_message + "\n" +
	  "<" + functionStep.outputs.url + 
          "&scope=openid%20profile&response_type=code&state=" + VerifyMeWorkflow.inputs.interactivity.interactor.id + "_" + inputForm.outputs.fields.user +
          "&redirect_uri=http://35.184.128.193/callback" +
	  "|sign-in to verify>",
});

 // + inputForm.inputs.interactivity.interactor.id + " has requested verification. Click here to verify ",
  // https://dev-81128127.okta.com/oauth2/default/v1/authorize?client_id=0oafjyboyveQoRysj5d7&scope=openid%20profile&response_type=code&redirect_uri=https%3A%2F%2Fhooks.slack.com%2Ftriggers%2F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&state=x2Z7pbwws2aw0F203YQWqYs4cWrecXBFI3KYi6Iaj8A",
export default VerifyMeWorkflow;
