
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

var error_view: {
          type: 'modal',
          callback_id: 'error_screen',
          title: {
          	type: 'plain_text',
          	text: 'EVA'
          },
          blocks: error_modal,
}

export default error_view;
