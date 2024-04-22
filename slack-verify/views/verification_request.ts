
var verification_request =
[
        {
                "type": "section",
                "block_id": "section500",
                "text": {
                        "type": "mrkdwn",
                        "text": "_*User verification request*_\nFrom"
                },
                "accessory": {
                        "type": "image",
                        "image_url": "https://",
                        "alt_text": "logo"
                }
        },
        {
                "type": "actions",
                "block_id": "approve-deny-buttons",
                "elements": [
                        {
                                "type": "button",
                                "text": {
                                        "type": "plain_text",
                                        "text": "Approve"
                                }
                        },
                        {
                                "type": "button",
                                "text": {
                                        "type": "plain_text",
                                        "text": "Deny"
                                },
                                "style": "danger",
                                "action_id": "deny",
                        }
                ]
        }
]

export default verification_request
