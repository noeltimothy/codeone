
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import configure_eva_view from "../views/configure_eva.ts"
import EvaConfigurationDatastore from "../datastores/eva_configuration.ts"

var config = {
	team_id: "galactica",
	domain: "",
	key: "",
	logo: "",
	request_message: "Hi, I would like to verify if you are on the call.",
	response_message: "I have verified my credentials.",
	timeout_message: "Your verification request has been timed-out.",
	timeout: 60
}

export const configure_eva_fn = DefineFunction({
	callback_id: "configure-eva",
	title: "Configure EVA",
	source_file: "./functions/configure_eva.ts",
	input_parameters: {
 		properties: { interactivity: { type: Schema.slack.types.interactivity } },
  		required: ["interactivity"],
  	},
  	output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
	configure_eva_fn,
  	async ({ inputs, client }) => {
    		var response = await client.apps.datastore.query<
      			typeof EvaConfigurationDatastore.definition
    		>({
      			datastore: EvaConfigurationDatastore.name,
      			team_id: "galactica",
    		});

		if (response.ok && (response.items.length > 0)) {
                        configure_eva_view.blocks[4]['element']['initial_value'] = response.items[0].domain;
                	configure_eva_view.blocks[5]['element']['initial_value'] = response.items[0].key;
                	configure_eva_view.blocks[6]['element']['initial_value'] = response.items[0].request_message;
                	configure_eva_view.blocks[7]['element']['initial_value'] = response.items[0].response_message;
                	configure_eva_view.blocks[8]['element']['initial_value'] = response.items[0].timeout_message;
               	 	configure_eva_view.blocks[9]['element']['initial_value'] = response.items[0].logo;
                	configure_eva_view.blocks[10]['element']['initial_value'] = String(response.items[0].timeout);
		} else {
                	configure_eva_view.blocks[6]['element']['initial_value'] = config.request_message;
                	configure_eva_view.blocks[7]['element']['initial_value'] = config.response_message;
                	configure_eva_view.blocks[8]['element']['initial_value'] = config.timeout_message;
                	configure_eva_view.blocks[10]['element']['initial_value'] = String(config.timeout);
		}

    		response = await client.views.open({
        		interactivity_pointer: inputs.interactivity.interactivity_pointer,
      			view: configure_eva_view
    		});

    		if (response.error) {
      			const error =
       		 	`Failed to open a modal. Contact the app maintainers with the following information - (error: ${response.error})`;
      			return { error };
    		} return {
      			completed: false,
    		};
  	},
)
.addViewSubmissionHandler(["configure_screen"], async ({ client, body, view }) => {
	console.log(view.state.values);

        const data = view.state.values; //body['view']['state']['values'];

        for (var k in data) {
                if ('domain' in data[k]) {
                    config.domain = data[k].domain.value
                }
                if ('key' in data[k]) {
                    config.key = data[k]['key']['value']
                }
                if ('custom_request_message' in data[k]) {
                    config.request_message = data[k]['custom_request_message']['value']
                }
                if ('custom_response_message' in data[k]) {
                    config.response_message = data[k]['custom_response_message']['value']
                }
                if ('custom_timeout_message' in data[k]) {
                    config.timeout_message = data[k]['custom_timeout_message']['value']
                }
                if ('logo' in data[k]) {
                    config.logo = data[k]['logo']['value']
                }
                if ('timeout' in data[k]) {
                    config.timeout = data[k]['timeout']['value']
                }
        }

        const putResponse = await client.apps.datastore.put<
      		typeof EvaConfigurationDatastore.definition
    	>({
      		datastore: EvaConfigurationDatastore.name,
      		item: config
        });

        var msg = "You have successfully configured EVA!";
	if (!putResponse.ok) {
		msg = "Failed to write configuration to the datastore: " + putResponse.error;
	}

        await client.chat.postMessage({
                channel: body.user.id,
                text: msg
        });
  })
  // ---------------------------
  // The handler that can be called when the second modal data is closed.
  // If your app runs some resource-intensive operations on the backend side,
  // you can cancel the ongoing process and/or tell the end-user
  // what to do next in DM and so on.
  // ---------------------------
  .addViewClosedHandler(
    ["configure_screen"],
    ({ view }) => {
      console.log(`view_closed handler called: ${JSON.stringify(view)}`);
      return { completed: true };
    },
  );
