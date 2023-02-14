import express from 'express';
const router = express.Router();
import { basicAuth, comesFromHubspot } from '../services/auth.js';
import { sendSms } from '../services/sms.js';
export default function Router(app, messaging) {
  //   app.use(basicAuth);
  router.post('/', async (req, res) => {
    console.log('hit on workflows');
    try {
      const text = req.body.fields.staticInput;
      const type = req.query.type;
      const phone = req.body.fields.staticInput2;
      console.log('sending ' + type);
      if (type === 'sms') {
        const resp = await sendSms(messaging, phone, text, '34628124767');
        console.log(resp);
        res.sendStatus(200);
      }
    } catch (e) {
      res.send('error');
    }
  });

  return router;
}

// module.exports = Router;
