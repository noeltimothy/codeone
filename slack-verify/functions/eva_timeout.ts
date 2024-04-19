
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
		// TODO: Add target user here as well
 		properties: { 
			verifier: { type: Schema.slack.types.user_id },
		},
  		required: [],
  	},
  	output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
	timeout_fn,
  	async ({ client, verifier }) => {
		console.log ('slack timeout trigger function called');
    		var response = await client.apps.datastore.query<
      			typeof EvaConfigurationDatastore.definition
    		>({
      			datastore: EvaConfigurationDatastore.name,
      			team_id: "galactica",
    		});

		// TODO: we need to lookup the sessions datastore by verifier and target
		// if the flag says verification complete, we ignore sending the timeout message
		// if the flag says verification pending, we send out the timeout and remove the entry from the datastore.
		// Use EvaSessionDatastore here.
		if (response.ok && (response.items.length > 0) && (response.items[0].domain.startsWith('http'))) {
    			response = await client.chat.postMessage({
        			channel: verifier,
      				text: response.items[0].timeout_message
    			});
		} else {
			console.log ('none');
		}
  	},
);
