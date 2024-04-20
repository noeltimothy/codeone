
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import error_view from "../views/error.ts"
import EvaConfigurationDatastore from "../datastores/eva_configuration.ts"
import EvaSessionDatastore from "../datastores/eva_session.ts"

var timeout_header = "_*EVA verification timeout*_\n"
var timeout_response =
[
    {
      "type": "section",
      "block_id": "section567",
      "text": {
        "type": "mrkdwn",
        "text": "",
      },
      "accessory": {
        "type": "image",
        "image_url": "",
        "alt_text": "logo"
      }
    }
]

export const timeout_fn = DefineFunction({
	callback_id: "eva-timeout",
	title: "EVA Verification Timeout",
	source_file: "./functions/eva_timeout.ts",
	input_parameters: {
 		properties: { 
			verifier_target: { type: Schema.types.string },
		},
  		required: [],
  	},
  	output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
	timeout_fn,
  	async ({ client, inputs }) => {
		console.log ('slack timeout trigger function called: ' + inputs.verifier_target);
    		var response = await client.apps.datastore.query<
      			typeof EvaSessionDatastore.definition
    		>({
      			datastore: EvaSessionDatastore.name,
      			verifier_target: inputs.verifier_target,
    		});

		if (response.ok && (response.items.length > 0) && (response.items[0].flag == "pending")) {
			var [ verifier, target ] = inputs.verifier_target.split('_');
    			response = await client.chat.postMessage({
        			channel: verifier,
      				text: response.items[0].timeout_message
    			});
		} else {
			console.log ('none');
		}

		return { completed: false };
  	},
);
