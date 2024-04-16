# Slack Verification App

## Enterprise version
Welcome to the enterprise version of slack-verify. This app works by allowing users to verify their callers to avoid potential security breaches in large enterprises.

### Overview
- slack-verify works by allowing users also called the verifier to send a verification request to a caller.
- The caller in return receives a verification request and responds by clicking a single-sign on link. Currently, slack-verify supports OKTA for SSO.
- Once, the caller successfully logs into his SSO provider, the verifier is notified with a success messages allowing him to take actions securely and without compromise.

### How to Run
The Enterprise edition of slack-verify runs using the slack CLI. Please see [slack cli](https://api.slack.com/automation/quickstart) for more reference
Pre-requisites:
- Install slack CLI
- Clone this github repo and then run the following:

```
cd slack-verify
sudo slack trigger create triggers/configure_eva.ts
sudo slack trigger create triggers/verification_start.ts
sudo slack trigger create triggers/incoming.ts
sudo slack deploy
```

### Details

#### Sending a verification request
The entry point of this slack application is triggered using a slack workflow when a user wishes to verify someone.
The user types "/start verification" and will be prompted with a form to send a verification request to the person they wish to verify.

This trigger is an interactive trigger and is under
```
triggers/verification_start.ts
```

#### Registering a webhook trigger into Slack
For the verification to work, any SSO or oAuth provider will need a redirect URL hosted by your webserver. This URL can be an incoming webhook in slack.
We register a webhook using the slack CLI.

```
webhook trigger is defined in - triggers/verification_complete.ts
sudo slack trigger create --trigger-def triggers/verification_complete.ts
```

After executing the `slack trigger create` command, you will be presented with a webhook URL as follows:

```
https://hooks.slack.com/triggers/xxxxxxx/6782502684643/a75f5e676d4bc116bd96952be02b7f84
```

#### Responding to a verification request
The verifier will receive a "verification request" on the galactica bot with a link to verify. The verification link currently supports SSO using Okta.
The verification link is an authorize call to okta as follows:

```
https://<okta-domain-url>/oauth2/default/v1/authorize?client_id=<client_id>&scope=openid%20profile&response_type=code&redirect_uri=https://localhost:5000/callback&state=<sender>
```

Note, for the above to work, you need to have an Okta domain and setup the redirect_uri for your Okta app to be the relay service(http://localhost:5000/callback) that is detaied in  the last step.

#### Successful verification
If the verifier was able to login to Okta SSO with the right credentials, the redirect URL which is the slack webhook will be called.
On receiving this trigger, we send a message to the sender via the slack bot to let him know that the verification is complete.
This is done in `workflows/verification_workflow.ts`

The following addStep action sends the final "verification complete" message to the sender.
```
VerificationWorkflow.addStep(Schema.slack.functions.sendDm, {
    user_id: "XXXXXXX",
    message: "verification success",
});
```

*Note: The user_id has been hard-coded as we are currently seeing that Okta is not able to send us the ID back using the &state=<sender> parameter.*

#### LIMITATIONS OF OKTA -> SLACK WEBHOOKS
After much analysis, it was found that the state value sent by Okta was not being sent correctly to the slack webhook. In order to overcome this, we depend on an external relay serverive that receives the "state" parameter from Okta's redirect callback and passes this to the slack webhook. The relay passes this variable to slack in the proper format that is expects.

Here is the relay that can be run via python flask:
```
from flask import Flask, request, jsonify
import requests

app = Flask("slack-server")
slack_webhook = "https://hooks.slack.com/triggers/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"

@app.route('/callback')
def callback():
    print (request.args)
    requests.post(slack_webhook, json={"state": request.args.get('state')})
    return jsonify({'success': 'success'})

if __name__ == '__main__':
    app.run(port=5000)
```
	
