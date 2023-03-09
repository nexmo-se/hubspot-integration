import { createHash } from 'crypto';
import { isEmpty } from '../utils.js';
export const basicAuth = async (req, res, next) => {
  const auth = { secret: process.env.signature }; // change this

  if (req.headers?.['x-neru-queue-name']?.startsWith(`${process.env.queue}`)) {
    return next();
  }
  if (!req.headers['x-hubspot-signature']) return res.status(401).send('Authentication required.');

  const signature = req.headers['x-hubspot-signature'];

  const string = `${auth.secret}${req.method}https://${process.env.INSTANCE_SERVICE_NAME}.${
    process.env.REGION.split('.')[1]
  }.serverless.vonage.com${req.originalUrl}${isEmpty(req.body) ? '' : JSON.stringify(req.body)}`;
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
      req.headers.referer.includes('hubspot.com'))
  ) {
    return next();
  } else {
    res.status(401).send('Authentication required.');
  }
};
