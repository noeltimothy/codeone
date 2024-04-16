import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SampleObjectDatastore from "../datastores/sample_datastore.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const StoreConfiguration = DefineFunction({
  callback_id: "store_configuration",
  title: "Store EVA configuration",
  description: "Stores EVA configuration parameters",
  source_file: "functions/store_configuration.ts",
  input_parameters: {
    properties: {
      domain: {
        type: Schema.types.string,
        description: "External Authentication Domain",
      },
      key: {
        type: Schema.types.string,
        description: "External Authentication key",
      },
      message: {
        type: Schema.types.string,
        description: "Default Verification request message",
      }
    },
    required: ["domain", "key", "message"],
  },
  output_parameters: {
    properties: {
    },
    required: [],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  StoreConfiguration,
  async ({ inputs, client }) => {
	  console.log (inputs);

    console.log ("Adding config to datastore: " + "galactica" + " domain:" + inputs.domain);
    const sampleObject = {
      team_id: "galactica",
      domain: inputs.domain,
      key: inputs.key,
      message: inputs.message,
    };

    // Save the sample object to the datastore
    // https://api.slack.com/automation/datastores
    const putResponse = await client.apps.datastore.put<
      typeof SampleObjectDatastore.definition
    >({
      datastore: SampleObjectDatastore.name,
      item: {
          team_id: "galactica",
          domain: inputs.domain,
          key: inputs.key,
          message: inputs.message,
      },
    });

    console.log (putResponse);

    if (!putResponse.ok) {
      return {
        error: `Failed to put item into the datastore: ${putResponse.error}`,
      };
    } else {
      console.log ("stored eva configuration");
    }

    return { outputs: {} };
  },
);
