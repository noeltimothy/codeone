import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import EvaConfigurationDatastore from "../datastores/eva_configuration.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const ReadConfiguration = DefineFunction({
  callback_id: "read_configuration",
  title: "Read EVA configuration",
  description: "Reads EVA configuration parameters from the datastore",
  source_file: "functions/read_configuration.ts",
  input_parameters: {
    properties: {
      custom_message: {
	      type: Schema.types.string,
	      description: "Custom message from the User",
      },
    },
    required: [],
  },
  output_parameters: {
    properties: {
      updated_message: {
        type: Schema.types.string,
        description: "The default message that need to be sent to the verifier",
      },
      url: {
        type: Schema.types.string,
        description: "sign-in link",
      },
    },
    required: ["updated_message", "url"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  ReadConfiguration,
  async ({ inputs, client }) => {
    var updated_message = ""
    console.log (inputs);

    console.log ("Reading config from datastore");

    // Save the sample object to the datastore
    // https://api.slack.com/automation/datastores
    const response = await client.apps.datastore.query<
      typeof SampleObjectDatastore.definition
    >({
      datastore: SampleObjectDatastore.name,
      team_id: "galactica",
    });

    console.log (response);

    if (!response.ok) {
      return {
        error: `Failed to read item into the datastore: ${response.error}`,
      };
    } else {
      console.log ("read eva configuration");
    }

    const url = response.items[0].domain + "?client_id=" + response.items[0].key; 
    if (inputs?.custom_message?.length > 0) {
	updated_message = custom_message;
    } else {
    	updated_message = response.items[0].message;
    }

    console.log (url);
    console.log (updated_message);
    return { outputs: { updated_message, url } };
  },
);
