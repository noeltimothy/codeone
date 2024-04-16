
const { App, ExpressReceiver } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');
const bodyParser = require('body-parser')
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET })
receiver.router.use(bodyParser.urlencoded({ extended: true }))
receiver.router.use(bodyParser.json())

var domain = "https://dev-81128127.okta.com/";
var key = "0oafjyboyveQoRysj5d7";
var logo = "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg";
var custom_request_message = "Hi, I would like to verify if you are on the call";
var timeout = 60*1000;
var this_ip = "34.41.234.76";
var timeouts = {}

var response_header = "_*User verification response*_\n"
var response_message = "\nI have successfully verified myself by signing in"

var timeout_header = "_*User verification timed-out*_\n"
var timeout_message = "User failed verification and was timed-out by EVA"

var request_header = "_*User verification request*_\nFrom "

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

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
        "image_url": logo,
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
        "image_url": logo,
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
        "image_url": logo,
	"alt_text": "logo"
      }
    }
]
const okta_handler = async (req, res, slack) => {
	var query = require('url').parse(req.url,true).query;
	var [ verifier, target_user ] = query['state'].split('_');

	var tidx = verifier + '_' + target_user;
	if (tidx in timeouts) {
		clearTimeout(timeouts[tidx])
	}

	verification_response[0]['text']['text'] = response_header + "From <@" + target_user + ">:" + response_message;
	try {
	    await web.chat.postMessage({
		channel: verifier,
	        blocks: verification_response,
	    })
	} catch (error) {
		console.log (error)
	}
	res.writeHead(200);
	res.end();
}

const verification_timeout = async (verifier, target_user) => {
	timeout_response[0]['text']['text'] = timeout_header + "<@" + target_user + ">:\n" + timeout_message;
	try {
	    await web.chat.postMessage({
		channel: verifier,
		blocks: timeout_response,
	    })
	} catch (error) {
		console.log (error)
	}
}

// Initializes your app with your bot token and signing secret
const app = new App({
  	token: process.env.SLACK_BOT_TOKEN,
  	signingSecret: process.env.SLACK_SIGNING_SECRET,
	//receiver
	customRoutes: [{
		path: "/callback",
		method: ["GET"],
		handler: (req, res) => okta_handler(req, res, this)
	}]
});

receiver.router.get('/callback', (req, res) => {
	console.log (req.args)
    	/*await app.client.chat.postMessage({
      		channel: target_user,
      		text: msg 
    	});*/
	res.send(req.body);
	res.writeHead(200);
    	res.end();
})

// configure modal

const configuration_modal = 
[
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Configure EVA (Employee Verify App)",
				"emoji": true
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "plain_text",
					"text": "Use this screen to configure EVA. You will need to setup your external authentication parameters, custom messages and timeouts.",
					"emoji": true
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "domain",
				"placeholder": {
					"type": "plain_text",
					"text": "Ex, For Okta this is something like https://dev-912864.okta.com"
				}
			},
			"label": {
				"type": "plain_text",
				"text": "External Authentication Domain"
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "key",
				"placeholder": {
					"type": "plain_text",
					"text": "0your1client2key3from4Okta"
				}
			},
			"label": {
				"type": "plain_text",
				"text": "\nExternal Authentication Client Key",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"multiline": true,
				"initial_value": custom_request_message,
				"action_id": "custom_request_message"
			},
			"label": {
				"type": "plain_text",
				"text": "Your default verification request message",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "logo",
				"placeholder": {
					"type": "plain_text",
					"text": "Ex, https://mycompany.com/icon.png"
				}
			},
			"label": {
				"type": "plain_text",
				"text": "Customer Logo URL",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action",
				"placeholder": {
					"type": "plain_text",
					"text": "60"
				}
			},
			"label": {
				"type": "plain_text",
				"text": "Verification request timeout in seconds (defaults to 60 secs)",
				"emoji": true
			}
		}
]

var logo_section =
{
	"type": "image",
	"image_url": "",
	"alt_text": "alt text for image"
}

var message_section = 
{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"multiline": true,
				"action_id": "verification_message",
				"initial_value": ""
			},
			"label": {
				"type": "plain_text",
				"text": "Custom Verification message",
				"emoji": true
			}
}
var verification_modal = 
[
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*_User verification request_*\nThis request is sent as a security measure.\n*Caution:*\nPlease wait for EVA to notify you if this user is legitimate."
			},
			"accessory": logo_section,
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Select a user to verify"
			},
			"accessory": {
				"type": "users_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Verify user",
					"emoji": true
				},
				"action_id": "to_be_verified"
			}
		},
		message_section,
]

app.command('/configure-eva', async ({ command, ack, body, client, logger, respond }) => {
  	await ack();
	try {
    		const result = await client.views.open({
      			trigger_id: body.trigger_id,
			view: {
				type: 'modal',
				callback_id: 'configure_screen',
				title: {
       	   				type: 'plain_text',
          				text: 'Configure EVA'
				},
				blocks: configuration_modal,
        			submit: {
          				type: 'plain_text',
          				text: 'Submit'
        			}
			}
		});
	}
  	catch (error) {
    		logger.error(error);
  	}
});

app.view('configure_screen', async ({ ack, body, view, client, logger }) => {
	await ack();

	const user = body['user']['id'];
        const data = body['view']['state']['values'];

        for (var k in data) {
                if ('domain' in data[k]) {
                    domain = data[k]['domain']['value']
                }
                if ('key' in data[k]) {
                    key = data[k]['key']['value']
                }
                if ('custom_request_message' in data[k]) {
                    custom_request_message = data[k]['custom_request_message']['value']
                }
                if ('logo' in data[k]) {
                    logo = data[k]['logo']['value']
                }
                if ('timeout' in data[k]) {
                    timeout = data[k]['timeout']['value'] * 1000
                }
        }

        //logo_section['image_url'] = logo;
	//message_section['element']['initial_value'] = request_message;

	const msg = "You have successfully configured EVA!";
	try {
    		await client.chat.postMessage({
      			channel: user,
      			text: msg
    		});
  	}
  	catch (error) {
    		logger.error(error);
 	}
});

app.command('/eva-verify', async ({ command, ack, body, client, logger, respond }) => {
  	await ack();
        verification_modal[1]["accessory"]["image_url"] = logo;
	message_section['element']['initial_value'] = custom_request_message;
	try {
    		const result = await client.views.open({
      			trigger_id: body.trigger_id,
      			view: {
        			type: 'modal',
        			callback_id: 'verification_screen',
        			title: {
          				type: 'plain_text',
          				text: 'EVA'
        			},
        			blocks: verification_modal,
        			submit: {
          				type: 'plain_text',
          				text: 'Submit'
        			}
      			}
    		});
  	}
  	catch (error) {
    		logger.error(error);
  	}
});

app.view('verification_screen', async ({ ack, body, view, client, logger }) => {
	await ack();
	const verifier = body['user']['id'];
	const data = body['view']['state']['values'];
	var target_user = "";

        for (var k in data) {
                if ('to_be_verified' in data[k]) {
                    target_user = data[k]['to_be_verified']['selected_user']
                }
                if ('verification_message' in data[k]) {
                    custom_request_message = data[k]['verification_message']['value']
                }
	}

        verification_request[0]['text']['text'] = request_header + "<@" + verifier + ">: " +
		  custom_request_message + "\n" +
	          "<" + domain + "oauth2/default/v1/authorize?client_id=" + key +
	          "&scope=openid%20profile&response_type=code&state=" + verifier + "_" + target_user +
	          "&redirect_uri=http://" + this_ip + "/callback" +
	          "|sign-in to verify>";

	try {
    		await client.chat.postMessage({
      			channel: target_user,
      			blocks: verification_request, 
    		});

		var timer = setTimeout(verification_timeout, timeout, verifier, target_user);
		timeouts[verifier+'_'+target_user] = timer;
  	}
  	catch (error) {
    		logger.error(error);
 	}
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
