

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
                                "initial_value": "",
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
                                "initial_value": "",
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
                                "multiline": true,
                                "initial_value": "",
                                "action_id": "custom_timeout_message"
                        },
                        "label": {
                                "type": "plain_text",
                                "text": "This is the default timeout message",
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

const configure_eva_view =
{
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

export default configure_eva_view
