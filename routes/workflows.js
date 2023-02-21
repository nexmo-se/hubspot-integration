import express from 'express';
const router = express.Router();
import { basicAuth, comesFromHubspot } from '../services/auth.js';
import { sendSms } from '../services/sms.js';
export default function Router(app, messaging) {
  router.post('/', async (req, res) => {
    console.log('hit on workflows');
    try {
      console.log(req.body);

      const text = req.body?.fields?.staticInput;
      const type = req.query?.type;
      const phone = req.body?.fields?.staticInput2;
      const to = req.body?.object?.properties?.phone;
      console.log('sending ' + type);
      if (type === 'sms') {
        const resp = await sendSms(messaging, phone, text, to);
        console.log(resp);
        res.sendStatus(200);
      }
      if (!text || !type || !phone || !to) {
        throw new Error('There is a missing parameter ');
      }
    } catch (e) {
      console.log(e);

      res.status(500).send(e);
    }
  });

  return router;
}

// module.exports = Router;
