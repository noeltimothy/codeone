
const { App, ExpressReceiver } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');
const { FileInstallationStore } = require('@slack/oauth');
const fs = require('fs')

const bodyParser = require('body-parser')

var store = {}

const client_id = "597092345203.6877747015651";
const client_secret = "6bb89a4b23ec67a814eb69a9f237c09e";

//var domain = "https://dev-81128127.okta.com/";
var domain = "Ex, For Okta this is something like https://dev-912864.okta.com"
var key = "0oafjyboyveQoRysj5d7";
var logo = "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg";
var custom_request_message = "Hi, I would like to verify if you are on the call.";
var custom_response_message = "I have verified my credentials.";
var timeout = 60;
var this_ip = "eva.galacticalabs.com"; //"34.41.234.76";
var timeouts = {}

var response_header = "_*User verification response*_\n"
var timeout_header = "_*User verification timed-out*_\n"
var timeout_message = "User failed verification and was timed-out by EVA"
var request_header = "_*User verification request*_\nFrom "

// HELPER FUNCTIONS - DB

const db_write = (key, obj) => {
	fs.writeFileSync(key+'.json', JSON.stringify(obj), { flag: 'w' })
}
const db_read = (key) => {
	const json_data = JSON.parse(fs.readFileSync(key+'.json'));
	return json_data;
}

const create_web_client = (team) => {
	const json_data = JSON.parse(fs.readFileSync(team+'.json'));
	store[json_data['team']['id']] = new WebClient(json_data.bot.token);
}

const update_config = (team, key, value) => {
	const json_data = JSON.parse(fs.readFileSync(team+'.json'));
	json_data[key] = value;
	db_write(team, json_data);
}


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
	var [ team, verifier, target_user ] = query['state'].split('_');

	const json_data = db_read(team);

	var tidx = verifier + '_' + target_user;
	if (tidx in timeouts) {
		clearTimeout(timeouts[tidx])
	}

	verification_response[0]['text']['text'] = response_header + "From <@" + target_user + ">:" + json_data.custom_response_message;
	verification_response[0]['accessory']['image_url'] = json_data.logo;

	const web_client = store[team]
	try {
	    await web_client.chat.postMessage({
		channel: verifier,
	        blocks: verification_response,
	    })
	} catch (error) {
		console.log (error)
	}
	res.writeHead(200);
	res.end();
}

const oauth_handler = async (req, res) => {
	let code = req.param("code");
        return app.client.oauth.access({
            client_id: client_id,
            client_secret: client_secret,
            code: code
        }).then(async (result) => {
        // save result of oauth.access call somewhere, like in a database.
        // redirect user afterwards with res.redirect to an url that will say something like "Thanks for installing!" perhaps.
		console.log ("Successfully obtained app tokens for new install")
        }).catch((error) => {
            throw error;
        });
}


const verification_timeout = async (team, verifier, target_user) => {
	const json_data = db_read(team);

	timeout_response[0]['text']['text'] = timeout_header + "<@" + target_user + ">:\n" + timeout_message;
	timeout_response[0]['accessory']['image_url'] = json_data.logo;
	const web_client = store[team]

	try {
	    await web_client.chat.postMessage({
		channel: verifier,
		blocks: timeout_response,
	    })
	} catch (error) {
		console.log (error)
	}
}

// Initializes your app with your bot token and signing secret
const app = new App({
  	//token: process.env.SLACK_BOT_TOKEN,
  	signingSecret: process.env.SLACK_SIGNING_SECRET,
	processBeforeResponse: true,
	customRoutes: [{
		path: "/callback",
		method: ["GET"],
		handler: (req, res) => okta_handler(req, res, this)
	}],
	clientId: client_id,
	clientSecret: client_secret,
	stateSecret: 'my-secret',
	scopes: ['chat:write', 'commands', 'incoming-webhook'],
  	installationStore: {
    		storeInstallation: async (installation) => {
      			// Bolt will pass your handler an installation object
      			// Change the lines below so they save to your database
      			if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
				db_write(installation.enterprise.id, installation);
			 	//store[installation.enterprise.id] = installation;

				var bot_token = installation['bot']['token'];
				store[installation.enterprise.id] = new WebClient(bot_token);
				console.log ('stored installation by enterprise id', installation.enterprise.id);
       			 	//return await database.set(installation.enterprise.id, installation);
      			}
      			if (installation.team !== undefined) {
       			 	//return await database.set(installation.team.id, installation);
       			 	//store[installation.team.id] = installation;

				db_write(installation.team.id, installation);
	update_config(team, 'domain', domain);
	update_config(team, 'key', key);
	update_config(team, 'custom_request_message', custom_request_message);
	update_config(team, 'custom_response_message', custom_response_message);
	update_config(team, 'logo', logo);
	update_config(team, 'timeout', timeout);
				var bot_token = installation['bot']['token'];
				store[installation.team.id] = new WebClient(bot_token);
				console.log ('stored installation by team id', installation.team.id);
      			}
      			//throw new Error('Failed saving installation data to installationStore');
    		},
    		fetchInstallation: async (installQuery) => {
      			// Bolt will pass your handler an installQuery object
     			 // Change the lines below so they fetch from your database
      			if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
       			 // handle org wide app installation lookup
				create_web_client(installQuery.enterpriseId);
				return db_read(installQuery.enterpriseId);
				//return store[installQuery.enterpriseId];
       			 	//return await database.get(installQuery.enterpriseId);
      			}
      			if (installQuery.teamId !== undefined) {
       			 	// single team app installation lookup
				console.log ('reading bot tokens');
				create_web_client(installQuery.teamId);
				return db_read(installQuery.teamId);
				//return store[installQuery.teamId];
       			 	//return await database.get(installQuery.teamId);
      			}
      			throw new Error('Failed fetching installation');
  		},
 		installerOptions: {
   		 	directInstall: true,
			userScopes: ['chat:write'], //, 'commands', 'incoming-webhook'],
     			/*callbackOptions: {
        			success: (installation, installOptions, req, res) => {
          				// Do custom success logic here
          				res.send('successful!');
        			}, 
        			failure: (error, installOptions , req, res) => {
          				// Do custom failure logic here
          				res.send('failure');
        			}
      			}*/
 		 }
	},
});

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
					"text": "Use this screen to configure EVA. You will need to setup your external authentication parameters, custom messages and timeouts.\n",
					"emoji": true
				}
			]
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*<http://foxio.io|Created by FoxIO>*"
			},
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
					"text": "***********************"
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
				"multiline": true,
				"initial_value": custom_response_message,
				"action_id": "custom_response_message"
			},
			"label": {
				"type": "plain_text",
				"text": "Your default verification response message",
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

var error_modal = 
[
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ""
			},
		}
]

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
	console.log (body);

	const team = body['team_id'];

	try {
		const json_data = db_read(team);

		if (json_data.domain.startsWith('http')) {
			configuration_modal[4]['element']['initial_value'] = json_data.domain;
		}

		configuration_modal[5]['element']['initial_value'] = json_data.key;
		configuration_modal[6]['element']['initial_value'] = json_data.custom_request_message;
		configuration_modal[7]['element']['initial_value'] = json_data.custom_response_message;
		configuration_modal[8]['element']['initial_value'] = json_data.logo;
		configuration_modal[9]['element']['initial_value'] = String(json_data.timeout);
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
	console.log ('configure screen submission called');
	//await ack();

	const user = body['user']['id'];
	const team = body['team']['id'];
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
                if ('custom_response_message' in data[k]) {
                    custom_response_message = data[k]['custom_response_message']['value']
                }
                if ('logo' in data[k]) {
                    logo = data[k]['logo']['value']
                }
                if ('timeout' in data[k]) {
                    timeout = data[k]['timeout']['value']
                }
        }

	console.log (body);
	update_config(team, 'domain', domain);
	update_config(team, 'key', key);
	update_config(team, 'custom_request_message', custom_request_message);
	update_config(team, 'custom_response_message', custom_response_message);
	update_config(team, 'logo', logo);
	update_config(team, 'timeout', timeout);

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

app.command('/eva-verify', async ({ command, ack, body, client, say, logger, respond }) => {
  	await ack();
	const team = body['team_id'];

	const json_data = db_read(team);

        verification_modal[1]["accessory"]["image_url"] = json_data.logo;
	message_section['element']['initial_value'] = json_data.custom_request_message;

	try {
		if (!json_data.domain.startsWith('http')) {
		  error_modal[1]['text']['text'] = "`EVA has not been configured properly. Please contact your administrator.`";
    		  const result = await client.views.open({
      			trigger_id: body.trigger_id,
      			view: {
        			type: 'modal',
        			callback_id: 'error_screen',
        			title: {
          				type: 'plain_text',
          				text: 'EVA'
        			},
        			blocks: error_modal,
      			}
    		  });
		} else {
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
  	}
  	catch (error) {
    		logger.error(error);
  	}
});

app.view('verification_screen', async ({ ack, body, view, client, logger }) => {
	await ack();

	const verifier = body['user']['id'];
	const data = body['view']['state']['values'];
	const team = body['team']['id']
	var target_user = "";

	const json_data = db_read(team);
	var modified_message = json_data.custom_request_message;

        for (var k in data) {
                if ('to_be_verified' in data[k]) {
                    target_user = data[k]['to_be_verified']['selected_user']
                }
                if ('verification_message' in data[k]) {
                    modified_message = data[k]['verification_message']['value']
                }
	}

	verification_request[0]['accessory']['image_url'] = json_data.logo;
        verification_request[0]['text']['text'] = request_header + "<@" + verifier + ">: " +
		  modified_message + "\n" +
	          "<" + json_data.domain + "oauth2/default/v1/authorize?client_id=" + json_data.key +
	          "&scope=openid%20profile&response_type=code&state=" + team + "_" + verifier + "_" + target_user +
	          "&redirect_uri=https://" + this_ip + "/callback" +
	          "|sign-in to verify>";

	try {
    		await client.chat.postMessage({
      			channel: target_user,
      			blocks: verification_request, 
    		});

		var timer = setTimeout(verification_timeout, Number(json_data.timeout)*1000, team, verifier, target_user);
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
