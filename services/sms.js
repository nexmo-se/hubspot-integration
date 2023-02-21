export const sendSms = async (messaging, sender, text, to) => {
  const vonageNumber = { type: 'sms', number: 'test' };
  console.log('sending' + text);

  try {
    const response = await messaging
      .send({
        message_type: 'text',
        to: to,
        from: sender ? sender : vonageNumber.number,
        channel: vonageNumber.type,
        text: text,
      })
      .execute();
    return response;
  } catch (e) {
    return new Error(e.response.data.detail);
  }
};
