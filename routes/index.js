import express from 'express';
const router = express.Router();
import axios from 'axios';
import request from 'request-promise-native';
import NodeCache from 'node-cache';
//===========================================================================//
//  HUBSPOT APP CONFIGURATION
//
//  All the following values must match configuration settings in your app.
//  They will be used to build the OAuth URL, which users visit to begin
//  installing. If they don't match your app's configuration, users will
//  see an error page.

// Replace the following with the values from your app auth config,
// or set them as environment variables before running.
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });
// Scopes for this app will default to `crm.objects.contacts.read`
// To request others, set the SCOPE environment variable instead
let SCOPES = ['crm.objects.contacts.read'];
if (process.env.SCOPE) {
  SCOPES = process.env.SCOPE.split(/ |, ?|%20/).join(' ');
}

// On successful install, users will be redirected to /oauth-callback
const REDIRECT_URI = `https://${process.env.INSTANCE_SERVICE_NAME}.${
  process.env.REGION.split('.')[1]
}.serverless.vonage.com/oauth-callback`;

const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
  `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

export default function Router() {
  //   router.get('/oauth-callback`', async (req, res) => {
  //     try {
  //       res.json({ e: 'hello' });
  //     } catch (e) {
  //       console.log(e);
  //       res.send(e);
  //       //   next(e);
  //     }
  //   });

  router.get('/oauth-callback', async (req, res) => {
    console.log('===> Step 3: Handling the request sent by the server');

    // Received a user authorization code, so now combine that with the other
    // required values and exchange both for an access token and a refresh token
    if (req.query.code) {
      console.log('       > Received an authorization token');

      const authCodeProof = {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: req.query.code,
      };

      // Step 4
      // Exchange the authorization code for an access token and refresh token
      console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
      const token = await exchangeForTokens(req.sessionID, authCodeProof);
      if (token.message) {
        return res.redirect(`/error?msg=${token.message}`);
      }

      // Once the tokens have been retrieved, use them to make a query
      // to the HubSpot API
      res.redirect(`/`);
    }
  });

  router.get('/install', (req, res) => {
    console.log('');
    console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
    console.log('');
    console.log("===> Step 1: Redirecting user to your app's OAuth URL");
    res.redirect(authUrl);
    console.log('===> Step 2: User is being prompted for consent by HubSpot');
  });

  router.get('/', (req, res) => {
    res.send('hello and welcome');
  });

  const exchangeForTokens = async (userId, exchangeProof) => {
    try {
      const responseBody = await request.post(
        'https://api.hubapi.com/oauth/v1/token',
        { form: exchangeProof }
        //    {
        //     form: exchangeProof,
        //   }
      );
      // Usually, this token data should be persisted in a database and associated with
      // a user identity.
      const tokens = JSON.parse(responseBody);
      refreshTokenStore[userId] = tokens.refresh_token;
      accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

      console.log('       > Received an access token and refresh token');
      return tokens.access_token;
    } catch (e) {
      console.log(e);

      console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token ` + e.message);
      return e.message;
    }
  };

  const refreshAccessToken = async (userId) => {
    const refreshTokenProof = {
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      refresh_token: refreshTokenStore[userId],
    };
    return await exchangeForTokens(userId, refreshTokenProof);
  };

  const getAccessToken = async (userId) => {
    // If the access token has expired, retrieve
    // a new one using the refresh token
    if (!accessTokenCache.get(userId)) {
      console.log('Refreshing expired access token');
      await refreshAccessToken(userId);
    }
    return accessTokenCache.get(userId);
  };

  const isAuthorized = (userId) => {
    return refreshTokenStore[userId] ? true : false;
  };

  return router;
}

// module.exports = Router;
