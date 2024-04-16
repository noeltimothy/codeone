
var logo_section =
{
        "type": "image",
        "image_url": "",
        "alt_text": "alt text for image"
}

const verification_modal = 
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
]

const eva_verify_view =
{
    type: 'modal',
    callback_id: 'verification_screen',
    title: {
        type: 'plain_text',
        text: 'EVA Verify'
    },
    blocks: verification_modal,
    submit: {
        type: 'plain_text',
        text: 'Submit'
    }
}

export default eva_verify_view
