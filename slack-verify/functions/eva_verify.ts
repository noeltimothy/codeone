
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import eva_verify_view from "../views/eva_verify.ts";
import timeout_fn from "../functions/eva_timeout.ts";
import error_view from "../views/error.ts";
import EvaConfigurationDatastore from "../datastores/eva_configuration.ts";
import EvaSessionDatastore from "../datastores/eva_session.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";

var timeouts = {};
var this_ip = "eva.galacticalabs.com";
var config = {};
var request_header = "_*User verification request*_\nFrom "
var request_sent_header = "_*EVA notification*_\n"

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

var verification_sent_notification =
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

var verification_response =
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

const newSession = async (client, verifier, target, timeout_message) => {
        const putResponse = await client.apps.datastore.put<
                typeof EvaSessionDatastore.definition
        >({
                datastore: EvaSessionDatastore.name,
                item: {
			verifier_target: verifier + "_" + target,
			flag: "pending",
			timeout_message: timeout_message
		}
        });
}


export const eva_verify_fn = DefineFunction({
	callback_id: "eva-verify",
	title: "EVA Verify",
	source_file: "./functions/eva_verify.ts",
	input_parameters: {
 		properties: { interactivity: { type: Schema.slack.types.interactivity } },
  		required: ["interactivity"],
  	},
  	output_parameters: { 
		properties: {},
		required: [] 
	},
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

		if (response.ok && (response.items.length > 0) && (response.items[0].domain.startsWith('http'))) {
			config = response.items[0];
                	eva_verify_view.blocks[1].accessory.image_url = String(response.items[0].logo);
                	eva_verify_view.blocks[4].element.initial_value = String(response.items[0].request_message);

    			response = await client.views.open({
        			interactivity_pointer: inputs.interactivity.interactivity_pointer,
      				view: eva_verify_view
    			});

		} else {
			error_view.blocks[1].text.text = "EVA has not been configured properly. Please contact your administrator.";
    			response = await client.views.open({
        			interactivity_pointer: inputs.interactivity.interactivity_pointer,
      				view: error_view
    			});
		}

    		if (response.error) {
      			const error =
       		 	`Failed to open a modal. Contact the app maintainers with the following information - (error: ${response.error})`;
      			return { error };
    		} return {
			completed: false,
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

        	verification_sent_notification[0].accessory.image_url = response.items[0].logo;
       	 	verification_sent_notification[0].text.text = request_sent_header + 
                    "A verification request has been sent to <@" + target_user+ ">. Please wait until EVA notifies you after the user verifies your request."

                await client.chat.postMessage({
                        channel: target_user,
                        blocks: verification_request,
                });

                await client.chat.postMessage({
                        channel: verifier,
                        blocks: verification_sent_notification,
                });
		
		newSession(client, verifier, target_user, response.items[0].timeout_message);

		const key = verifier + "_" + target_user;

    		// TODO: instead of hard-coding this to 10 seconds past now, we need to
   		// use the timeout from the datastore + now.
    		const scheduleDate = new Date();
   		scheduleDate.setSeconds(scheduleDate.getSeconds() + 10);

		console.log ('setting trigger to execute at: ' + scheduleDate.toUTCString());
    		const scheduledTrigger = await client.workflows.triggers.create({
      			name: "EVA timeout scheduler",
      			workflow: "#/workflows/eva-timeout-workflow",
      			type: TriggerTypes.Scheduled,
      			inputs: {
	        		verifier_target: { value: key },
      			},
      			schedule: {
        			start_time: scheduleDate.toUTCString(),
        			frequency: {
          				type: "once",
        			},
      			},
    		});

    		if (!scheduledTrigger.trigger) {
			console.log ("Trigger could not be created");
      			return {
        			error: "Trigger could not be created",
      			};
    		}


	} else {
		error_view.blocks[1].text.text = "EVA has not been configured properly. Please contact your administrator.";
    		response = await client.views.open({
        		interactivity_pointer: inputs.interactivity.interactivity_pointer,
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
