
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import eva_verify_view from "../views/eva_verify.ts"
import error_view from "../views/error.ts"
import EvaConfigurationDatastore from "../datastores/eva_configuration.ts"

var timeouts = {};
var this_ip = "eva.galacticalabs.com";
var config = {};
var request_header = "_*User verification request*_\nFrom "
var verification_request =
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

/*var verification_response =
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
]*/

export const eva_verify_fn = DefineFunction({
	callback_id: "eva-verify",
	title: "EVA Verify",
	source_file: "./functions/eva_verify.ts",
	input_parameters: {
 		properties: { interactivity: { type: Schema.slack.types.interactivity } },
  		required: ["interactivity"],
  	},
  	output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
	eva_verify_fn,
  	async ({ inputs, client, body }) => {
    		var response = await client.apps.datastore.query<
      			typeof EvaConfigurationDatastore.definition
    		>({
      			datastore: EvaConfigurationDatastore.name,
      			team_id: "galactica",
    		});

		if (response.ok && (response.items.length > 0)) {
			config = response.items[0];
                	eva_verify_view.blocks[1].accessory.image_url = String(response.items[0].logo);
                	eva_verify_view.blocks[4].element.initial_value = String(response.items[0].request_message);

    			response = await client.views.open({
        			interactivity_pointer: inputs.interactivity.interactivity_pointer,
      				view: eva_verify_view
    			});

    			if (response.error) {
      				const error =
       			 	`Failed to open a modal. Contact the app maintainers with the following information - (error: ${response.error})`;
      				return { error };
    			} return {
      				completed: false,
    			};
		} else {
			error_view.blocks[1].text.text = "EVA has not been configured properly. Please contact your administrator.";
    			response = await client.views.open({
        			trigger_id: body.trigger_id,
      				view: error_view
    			});
		}
  	},
)
.addViewSubmissionHandler(["verification_screen"], async ({ client, body, view }) => {
	console.log(view.state.values);

        const data = view.state.values; 
	const verifier = body.user.id;
	const team = body.team.id;
	var msg = "";
	var target_user;

        for (var k in data) {
                if ('verification_message' in data[k]) {
                    msg = data[k].verification_message.value;
                }
                if ('to_be_verified' in data[k]) {
                    target_user = data[k].to_be_verified.selected_user;
                }
        }

    	var response = await client.apps.datastore.query<
      		typeof EvaConfigurationDatastore.definition
    	>({
      		datastore: EvaConfigurationDatastore.name,
      		team_id: "galactica",
    	});

	if (response.ok && (response.items.length > 0)) {

        	verification_request[0].accessory.image_url = response.items[0].logo;
       	 	verification_request[0].text.text = request_header + "<@" + verifier + ">: " +
                  msg + "\n" +
                  "<" + response.items[0].domain + "oauth2/default/v1/authorize?client_id=" + response.items[0].key +
                  "&scope=openid%20profile&response_type=code&state=" + team + "_" + verifier + "_" + target_user +
                  "&redirect_uri=https://" + this_ip + "/callback" +
                  "|sign-in to verify>";

		console.log (verification_request);

                await client.chat.postMessage({
                        channel: target_user,
                        blocks: verification_request,
                });

                await client.chat.postMessage({
                        channel: verifier,
                        text: "A verification request has been sent to <@" + target_user+ ">. Please wait until EVA notifies you after the user verifies your request."
                });
                //var timer = setTimeout(verification_timeout, Number(config.timeout)*1000, team, verifier, target_user);
                //timeouts[verifier+'_'+target_user] = timer;
	} else {
		error_view.blocks[1].text.text = "EVA has not been configured properly. Please contact your administrator.";
    		response = await client.views.open({
        		trigger_id: body.trigger_id,
      			view: error_view
    		});
	}
  })
  // ---------------------------
  // The handler that can be called when the second modal data is closed.
  // If your app runs some resource-intensive operations on the backend side,
  // you can cancel the ongoing process and/or tell the end-user
  // what to do next in DM and so on.
  // ---------------------------
  .addViewClosedHandler(
    ["verification_screen"],
    ({ view }) => {
      console.log(`view_closed handler called: ${JSON.stringify(view)}`);
      return { completed: true };
    },
  );
