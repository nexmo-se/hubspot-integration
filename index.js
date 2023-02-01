import { neru, Messages } from 'neru-alpha';
import express from 'express';

const app = express();
const port = process.env.NERU_APP_PORT;

import bodyParser from 'body-parser';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { basicAuth, comesFromHubspot } from './services/auth.js';
import { getTemplates } from './services/templates.js';
import { getMessagesReport, getRecords } from './services/reports.js';

const session = neru.createSession();
const messaging = new Messages(session);

app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.get('/send', comesFromHubspot, async (req, res) => {
  let headerParams, urlNeeded, headerText;
  console.log(req.headers.referer);
  try {
    const phone = req.query.phone;
    const templates = await getTemplates();
    const templName = templates[0].name;
    const templateLanguage = templates[0].language;
    const header = templates[0].components.find((e) => e.type === 'HEADER');
    const headerNeedsInput = header?.format === 'TEXT' || header?.format === 'IMAGE' || header?.format === 'VIDEO';
    if (headerNeedsInput) {
      if (header.format === 'TEXT') {
        headerText = header.text;
        headerParams = getNumberParams(header.text);
      } else urlNeeded = true;
    }
    const templText = templates[0].components.find((e) => e.type === 'BODY').text;
    res.render('temp.ejs', {
      // hasHeader: headerNeedsInput,
      to: phone,
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

const getNumberParams = (text) => {
  return text.match(/[{{]/gi)?.length / 2;
};

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

// const getTemplates = () => {
//   var config = {
//     method: 'get',
//     url: `https://api.nexmo.com/v2/whatsapp-manager/wabas${process.env.waba}/templates`,
//     headers: {
//       Authorization: `Basic ${getAuth()}`,
//     },
//   };
//   return new Promise((res, rej) => {
//     axios(config)
//       .then(function (response) {
//         res(response.data.templates.filter((e) => e.status === 'APPROVED'));
//       })
//       .catch(function (error) {
//         console.log(error);
//         rej(error);
//       });
//   });
// };

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// const getMessagesReport = (results) => {
//   const responseObj = {};
//   responseObj.results = [];
//   results.forEach((r) => {
//     responseObj.results.push({
//       objectId: Math.floor(Math.random() * 10),
//       title: r.direction,
//       created: r.date_received,
//       from: r.from,
//       to: r.to,
//       message_body: r.message_body,
//     });
//   });
//   return responseObj.results.sort(function (a, b) {
//     return new Date(b.created) - new Date(a.created);
//   });
// };

// const getRecords = (direction, phone) => {
//   let url;
//   //   const baseUrl = `https://api.nexmo.com/v2/reports/records?account_id=ca37991c&limit=${process.env.limit}&product=MESSAGES&include_message=true&date_start=2023-01-08T00:00:00Z&direction=${direction}`;
//   const baseUrl = `https://api.nexmo.com/v2/reports/records?account_id=ca37991c&limit=${
//     process.env.limit
//   }&product=MESSAGES&include_message=true&date_start=${OneWeekAgo()}&direction=${direction}`;
//   if (direction === 'outbound') {
//     url = `${baseUrl}&to=${phone}`;
//   } else {
//     url = `${baseUrl}&from=${phone}`;
//   }
//   var config = {
//     method: 'get',
//     url: url,
//     headers: {
//       Authorization: `Basic ${getAuth()}`,
//     },
//   };
//   return new Promise((res, rej) => {
//     axios(config)
//       .then(function (response) {
//         res(response.data);
//       })
//       .catch(function (error) {
//         console.log(error);
//         rej(error);
//       });
//   });
// };

app.use(basicAuth);

// app.get('/install', (req, res) => {
//   console.log('');
//   console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
//   console.log('');
//   console.log("===> Step 1: Redirecting user to your app's OAuth URL");
//   res.redirect(authUrl);
//   console.log('===> Step 2: User is being prompted for consent by HubSpot');
// });

// app.get('/oauth-callback', async (req, res) => {
//   console.log('===> Step 3: Handling the request sent by the server');

//   // Received a user authorization code, so now combine that with the other
//   // required values and exchange both for an access token and a refresh token
//   if (req.query.code) {
//     console.log('       > Received an authorization token');

//     const authCodeProof = {
//       grant_type: 'authorization_code',
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       redirect_uri: REDIRECT_URI,
//       code: req.query.code,
//     };

//     // Step 4
//     // Exchange the authorization code for an access token and refresh token
//     console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
//     const token = await exchangeForTokens(req.sessionID, authCodeProof);
//     if (token.message) {
//       return res.redirect(`/error?msg=${token.message}`);
//     }

//     // Once the tokens have been retrieved, use them to make a query
//     // to the HubSpot API
//     res.redirect(`/`);
//   }
// });

// const exchangeForTokens = async (userId, exchangeProof) => {
//   try {
//     const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
//       form: exchangeProof,
//     });
//     // Usually, this token data should be persisted in a database and associated with
//     // a user identity.
//     const tokens = JSON.parse(responseBody);
//     refreshTokenStore[userId] = tokens.refresh_token;
//     accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

//     console.log('       > Received an access token and refresh token');
//     return tokens.access_token;
//   } catch (e) {
//     console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);
//     return JSON.parse(e.response.body);
//   }
// };

// const refreshAccessToken = async (userId) => {
//   const refreshTokenProof = {
//     grant_type: 'refresh_token',
//     client_id: CLIENT_ID,
//     client_secret: CLIENT_SECRET,
//     redirect_uri: REDIRECT_URI,
//     refresh_token: refreshTokenStore[userId],
//   };
//   return await exchangeForTokens(userId, refreshTokenProof);
// };

// const getAccessToken = async (userId) => {
//   // If the access token has expired, retrieve
//   // a new one using the refresh token
//   if (!accessTokenCache.get(userId)) {
//     console.log('Refreshing expired access token');
//     await refreshAccessToken(userId);
//   }
//   return accessTokenCache.get(userId);
// };

// const isAuthorized = (userId) => {
//   return refreshTokenStore[userId] ? true : false;
// };

app.get('/history', async (req, res) => {
  try {
    const phoneWithPlus = req.query.phone;
    const phone = phoneWithPlus.split('+')[1];
    const inbound = await getRecords('inbound', phone);
    const outbound = await getRecords('outbound', phone);
    const records = [...inbound.records, ...outbound.records];
    const response = getMessagesReport(records);

    res.send({ results: response });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get('/info', (req, res) => {
  const lastname = req.query.lastname;
  const phone = req.query.phone;

  res.send({
    results: [],
    primaryAction: {
      type: 'IFRAME',
      width: 890,
      height: 748,
      associatedObjectProperties: ['lastname', 'phone'],
      uri: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/send`,
      // uri: `https://neru-ca37991c-debug-debug.use1.serverless.vonage.com/send`,
      //   uri: `${neru.getAppUrl()}/send`,
      // uri: 'https://sms.ulgebra.com/send-sms?appCode=vonageforhubspotcrm&module=CONTACT&entityId=1#https://app-eu1.hubspot.com',
      label: 'Send message',
    },
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
