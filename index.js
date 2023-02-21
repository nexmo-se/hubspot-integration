import { neru, Messages } from 'neru-alpha';
import express from 'express';

const app = express();
const port = process.env.NERU_APP_PORT;

import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
// import session from 'express-session';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { basicAuth, comesFromHubspot } from './services/auth.js';
import { getTemplates } from './services/templates.js';
import { getMessagesReport, getRecords } from './services/reports.js';
import indexRouter from './routes/index.js';
import workflowRouter from './routes/workflows.js';
import { isEmpty } from './utils.js';
// app.use(
//   session({
//     secret: Math.random().toString(36).substring(2),
//     resave: false,
//     saveUninitialized: true,
//   })
// );

const sess = neru.createSession();
const messaging = new Messages(sess);

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', indexRouter());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/send', comesFromHubspot, async (req, res) => {
  console.log(req.headers.referer);
  try {
    const phone = req.query?.phone;
    res.render('index.ejs', {
      to: phone,
      channels: process.env.channels.split(','),
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post('/sendMessage', comesFromHubspot, async (req, res) => {
  try {
    const { text, to, channel, sender } = req.body;

    const vonageNumber = { type: channel, number: '447520660729' };
    console.log('sending ' + text + ' via ' + channel);

    const response = await messaging
      .send({
        message_type: 'text',
        to: to,
        from: sender ? sender : vonageNumber.number,
        channel: vonageNumber.type,
        text: text,
      })
      .execute();
    console.log(response);

    res.json({ res: 'okay' });
  } catch (e) {
    console.log(e);
    const error = new Error(e.response.data.detail);
    res.status(500).json({ error: error.message });
  }
});

app.get('/templates', comesFromHubspot, async (req, res) => {
  try {
    const templates = await getTemplates();
    res.send(templates);
  } catch (e) {
    res.status(500);
  }
});

app.post('/send-template', comesFromHubspot, async (req, res) => {
  const { params: parameters, to, name, urlObject, headerParameters, language } = req.body;

  let components = [];

  const parametersFormated = [];

  for (let parameter in parameters) {
    parametersFormated.push({ type: 'text', text: parameters[parameter] });
  }
  if (!isEmpty(urlObject)) {
    const headerObject = getHeaderUrl(urlObject);
    console.log(headerObject);

    components.push({
      type: 'header',
      parameters: [getHeaderUrl(urlObject)],
    });
  }

  if (!isEmpty(headerParameters)) {
    let headerParamsFormated = [];
    for (let parameter in headerParameters) {
      headerParamsFormated.push({ type: 'text', text: headerParameters[parameter] });
    }
    components.push({
      type: 'header',
      parameters: headerParamsFormated,
    });
  }

  components.push({
    type: 'body',
    parameters: parametersFormated,
  });

  const vonageNumber = { type: 'whatsapp', number: process.env.number };

  const custom = {
    message_type: 'custom',
    custom: {
      type: 'template',
      template: {
        name: name,
        language: {
          code: language,
          policy: 'deterministic',
        },
        components: components,
      },
    },
  };

  const response = await messaging
    .send({
      message_type: 'custom',
      to: to,
      from: vonageNumber.number,
      channel: vonageNumber.type,
      ...custom,
    })
    .execute();
  res.json({ res: 'okay' });
});

const getHeaderUrl = (urlObject) => {
  if (urlObject?.type === 'IMAGE') {
    // headerObject['image'] = { link: urlObject?.headerUrl };
    // return headerObject;
    return {
      type: urlObject?.type?.toLowerCase(),
      image: {
        link: urlObject?.headerUrl,
      },
    };
  }
  if (urlObject?.type === 'DOCUMENT') {
    return {
      type: urlObject?.type?.toLowerCase(),
      document: {
        link: urlObject?.headerUrl,
      },
    };
  }
  if (urlObject?.type === 'VIDEO') {
    return {
      type: urlObject?.type?.toLowerCase(),
      video: {
        link: urlObject?.headerUrl,
      },
    };
  }
};

app.use(basicAuth);

app.use('/workflows', workflowRouter(app, messaging));

app.get('/history', async (req, res) => {
  try {
    const phoneWithPlus = req.query?.phone;
    const phone = phoneWithPlus?.split('+')[1];
    const inbound = await getRecords('inbound', phone);
    const outbound = await getRecords('outbound', phone);
    const records = [...inbound.records, ...outbound.records];
    const response = getMessagesReport(records);
    if (!phone) throw new Error('no phone number provided');
    if (!records) throw new Error('something went wrong fetching conversation history');

    res.send({ results: response });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

app.get('/info', (req, res) => {
  const lastname = req.query?.lastname;
  const phone = req.query?.phone;

  res.send({
    results: [],
    primaryAction: {
      type: 'IFRAME',
      width: 890,
      height: 748,
      associatedObjectProperties: ['lastname', 'phone'],
      uri: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/send`,
      label: 'Send message',
    },
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
