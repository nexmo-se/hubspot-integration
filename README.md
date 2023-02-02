# hubspot-integration

This sample app shows you how to crete a connector that you can use in Hubspot to define custom CRM cards within your contacts.

This application allows you to send SMS, Viber and WhatsApp (text and template) messages

## Neru app deployment

For this integration to work you need to create a Hubspot Public application that will leverage CRM cards. The CRM cards will fetch information from this server. This section will show you how you can deploy the server.

The first step is to deploy this application in Neru.

1. Create a neru app and populate a `neru.yml` as per `sample.yml` (Important that the package.json app is creaded with esnext. Follow [this link](https://vonage-neru.herokuapp.com/neru/tutorials/neru-dialer/neru/dialer/create-project))
2. Install dependencies (`npm install`)
3. Deploy the neru app and copy the URL ending with `serverless.com`

## Hubspot application creation

You need to have a developer account to be able to create applications.

1. Create public application
2. Add the neru app URL in the Redirect URL (on the Auth tab)
3. Add the `crm.objects.contacts.read` scope (Auth tab)
4. On the left hand-side click on CRM cards
5. Create a CRM card called Send Message and another one called Conversation History.

   ![CRM Cards](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/crmcards.png)

6. Configure the Send Message Card as per the picture below and in the Fetch URL set `${neruAppUrl}/info`

![Send Message Card](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/sendmessacard.png)

6.1 In the Send Message Card, hit on the Custom actions Tab and add your `${neruAppUrl}` as a base URL under Base Action URLs.

![Send Message Card](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/sendmessageaction.png)

7. Configure the Conversation History Card as per the picture below and in the Fetch URL set `${neruAppUrl}/history`

![Send Message Card](https://github.com/nexmo-se/hubspot-integration/blob/main/public/images/historycard.png)
