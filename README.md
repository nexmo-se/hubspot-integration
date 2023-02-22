# hubspot-integration

This sample app shows you how to crete a connector that you can use in Hubspot to define custom CRM cards within your contacts and to send SMS via automation workflows..

This application allows you to send SMS, Viber and WhatsApp (text and template) messages from the Contacts page and allows for SMS sending via automation workflows.

## Hubspot application creation

You need to have a developer account to be able to create applications.

1. Create public application. See steps below

First, you need to select your application name. Then you can navigate to the Auth tab. In the auth tab, you need to fill in the Redirect URL. Use first a dummy value such as google.com (This is needed so that we can create the application and get the clientId and clientSecret). Select `crm.objects.contacts.read` as scope. Hit on save and copy the clientId and clientSecret into the `neru.yml` file. You can deploy the server side application now.

2. Deploy the neru app.

3. Add the neru app URL (instance host address 2) followed by `/oauth-callback` URL in the Redirect URL. Like this `${neruApp}/oauth-callback`.
4. On the left hand-side click on CRM cards
5. Create a CRM card called Send Message and another one called Conversation History.

   ![CRM Cards](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/crmcards.png)

6. Configure the Send Message Card as per the picture below and in the Fetch URL set `${neruAppUrl}/info`

![Send Message Card](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/sendmessacard.png)

6.1 In the Send Message Card, hit on the Custom actions Tab and add your `${neruAppUrl}` as a base URL under Base Action URLs.

![Send Message Card](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/sendmessageaction.png)

7. Configure the Conversation History Card as per the picture below and in the Fetch URL set `${neruAppUrl}/history`

![History](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/historycard.png)

Then configure the card properties as per the screenshot below.

![Card properties](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/cardproperties.png)

8. Grab the install URL from your app Auth tab and navigate to that URL. You need to have a separate (non-dev) account to install the application.

Once the app is installed, you should be able to see the new CRM cards when you navigate to the Contacts tab in hubspot.

## Neru app deployment

For this integration to work you need to create a Hubspot Public application that will leverage CRM cards. This has been explained above. The CRM cards will fetch information from this server. This section will show you how you can deploy the server.

The first step is to deploy this application in Neru.

1. Create a neru app and populate a `neru.yml` as per `sample.yml` (Important that the package.json app is creaded with esnext. Follow [this link](https://vonage-neru.herokuapp.com/neru/tutorials/neru-dialer/neru/dialer/create-project)). Don't select any starter template, because otherwise the package.json file will be overriden.
2. Install dependencies (`npm install`)
3. Deploy the neru app and copy the URL ending with `serverless.com`

## Environment variables (`neru.yml`)

Here you can find an explanation on the variables that you need to define on the `neru.yml` file

1. Limit. This parameter defines how many messages you want to see in the conversation history (CRM card) with a given contact in the Contacts Tab
2. Number. The whatsapp number that you want to use to send messages,
3. Signature. The client secret that you can get when you create your Hubspot application
4. waba. The Whatsapp Business Account ID
5. channels. The number of channels that can be used in the Send Message CRM card (Contacts page). It supports SMS, WhatsApp and Viber
6. apiKey. The Vonage API key.
7. apiSecret. The Vonage API secret.
8. CLIENT_ID. The client ID that you get from your Hubspot application.
9. hubspot_apikey. The hubspot API key that you can generate in the Hubspot developer account under the `Apps` section. See screenshot below.
10. appId. The hubspot application Id that you can get when you create your hubspot application. See screenshot below.

![app settings](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/appsettings.png)

## Workflows.

This application creates a custom action that you can use when creating a workflow. This means that you can define your own trigger based on your contacts and send an SMS when the trigger action executes.

To define a workflow, hit on the Automation tab and click on Workflows. Select create new Workflow of type contact. Define your custom trigger, add a new action and then scroll down until you see `Send SMS`. Just populate the message you want to send and the senderId (From) and you're good to go once you turn on the workflow.

Some ilustrative screenshots are provided below.

![Workflow definition](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/workflowaction.png)

![Workflow parameters](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/workflowdefinition.png)
