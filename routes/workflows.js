import express from 'express';
const router = express.Router();
import { basicAuth, comesFromHubspot } from '../services/auth.js';
import { sendSms } from '../services/sms.js';
export default function Router(app, messaging) {
  //   app.use(basicAuth);
  router.post('/', async (req, res) => {
    console.log('hit on workflows');
    try {
      console.log(req.body);

      const text = req.body.fields.staticInput;
      const type = req.query.type;
      const phone = req.body.fields.staticInput2;
      const to = req.body.object.properties.phone;
      console.log('sending ' + type);
      if (type === 'sms') {
        const resp = await sendSms(messaging, phone, text, to);
        console.log(resp);
        res.sendStatus(200);
      }
    } catch (e) {
      console.log(e);

      res.sendStatus(500);
    }
  });

  return router;
}

// module.exports = Router;
