import express from 'express';
const router = express.Router();
import { basicAuth, comesFromHubspot } from '../services/auth.js';
import { sendSms } from '../services/sms.js';
import { formatNumber } from '../utils.js';
export default function Router(app, messaging, neru, Queue) {
  router.post('/', async (req, res) => {
    try {
      const session = neru.createSession();
      const queueApi = new Queue(session);

      const text = req.body?.fields?.staticInput;
      const type = req.query?.type;
      const phone = req.body?.fields?.staticInput2;
      const to = req.body?.object?.properties?.phone;
      const toFormatted = formatNumber(to);
      const formattedData = [{ text, type, phone, toFormatted }];
      if (!text || !type || !phone || !to) {
        res.status(200).send('missing parameters');
      } else {
        await queueApi.enqueue('hubspot', formattedData).execute();
        res.sendStatus(200);
      }
    } catch (e) {
      console.log(e);

      res.status(500).send(e);
    }
  });
  router.post('/consumer', async (req, res) => {
    try {
      const { text, type, phone, toFormatted } = req.body;

      if (type === 'sms') {
        const resp = await sendSms(messaging, phone, text, toFormatted);
        console.log(resp);
        // console.log('mocking message to ' + phone);

        res.sendStatus(200);
      }
    } catch (e) {
      res.status(500).send(e.message);
    }
  });

  return router;
}

// module.exports = Router;
