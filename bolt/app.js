
const { App } = require('@slack/bolt');

console.log (process.env.SLACK_BOT_TOKEN);

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// configure modal

const configure_eva_modal_blocks = 
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
				"action_id": "plain_text_input-action",
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
				"action_id": "plain_text_input-action",
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
				"initial_value": "Hi, I would like to request you to verify if you are on the call.",
				"action_id": "plain_text_input-action"
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
				"action_id": "plain_text_input-action",
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

app.command('/configure-eva', async ({ command, ack, body, client, logger, respond }) => {
  	await ack();
	try {
    		const result = await client.views.open({
      			trigger_id: body.trigger_id,
      			//view: configure_eva_modal
			view: {
				type: 'modal',
				callback_id: 'configure_eva_modal',
				title: {
       	   				type: 'plain_text',
          				text: 'Configure EVA'
				},
				blocks: configure_eva_modal_blocks,
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
})

app.command('/eva-verify', async ({ command, ack, body, client, logger, respond }) => {
  await ack();
  //await respond(`${command.text}`);

  const message = "loaded from the database";

try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Welcome to a modal with _blocks_'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'input_c',
            label: {
              type: 'plain_text',
              text: message
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
	      initial_value: message,
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    logger.info(result);
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
