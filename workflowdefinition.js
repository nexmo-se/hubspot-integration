export const smsDefinition = {
  actionUrl: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/workflows?type=sms`,
  objectTypes: ['CONTACT'],
  published: 'true',
  inputFields: [
    {
      typeDefinition: {
        name: 'staticInput',
        type: 'string',
        fieldType: 'text',
      },
      supportedValueTypes: ['STATIC_VALUE'],
      isRequired: true,
    },
    {
      typeDefinition: {
        name: 'staticInput2',
        type: 'string',
        fieldType: 'text',
      },
      supportedValueTypes: ['STATIC_VALUE'],
      isRequired: false,
    },
  ],
  outputFields: [
    {
      typeDefinition: {
        name: 'myOutput',
        type: 'string',
        fieldType: 'text',
      },
      supportedValueTypes: ['STATIC_VALUE'],
    },
  ],
  objectRequestOptions: {
    properties: ['mobilenumber'],
  },
  labels: {
    en: {
      inputFieldLabels: {
        staticInput: 'Text',
        staticInput2: 'Sender Id (From)',
      },
      actionName: 'Send SMS',
      actionDescription: 'Fill out the following fields',
      appDisplayName: 'Send SMS',
      actionCardContent: 'Send SMS',
    },
  },
};