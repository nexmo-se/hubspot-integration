import { createHash } from 'crypto';

export const basicAuth = async (req, res, next) => {
  const auth = { secret: process.env.signature }; // change this
  if (!req.headers['x-hubspot-signature']) return res.status(401).send('Authentication required.');

  // parse login and password from headers
  const signature = req.headers['x-hubspot-signature'];
  const string = `${auth.secret}GEThttps://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com${
    req.originalUrl
  }`;
  const compareString = createHash('sha256').update(string).digest('hex');

  if (compareString === signature) {
    // Access granted...
    return next();
  } else {
    res.status(401).send('Authentication required.');
  }
};

export const comesFromHubspot = async (req, res, next) => {
  if (
    req.headers.referer &&
    (req.headers.referer.startsWith(
      `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com`
    ) ||
      req.headers.referer.startsWith('https://app-eu1.hubspot.com'))
  ) {
    return next();
  } else {
    res.status(401).send('Authentication required.');
  }
};
