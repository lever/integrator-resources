const axios = require('axios');
const cors = require('cors');
const express = require('express');
const session = require('express-session');
require('dotenv').config();
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(session({ secret: 'exampleOAuth' }));

// Dealing with Cors
app.use(cors());

// Making Process.env variables available to frontend
app.get('/dotenv', (req, res, next) => {
  res.json({
    clientID: process.env.clientID,
    redirectCallback: process.env.redirectCallback,
    scope: process.env.scope,
    state: process.env.state,
    baseURL: process.env.baseURL,
  });
});

/**
 * STEP 2 && 3: GET AUTH CODE && REQUEST ACCESS TOKEN
 * Redirecting the user in the frontend response to the callback URL http://localhost:3000/login
 * Listening at that route, the authorization code is retrieved from the request query
 * Change the route to reflect your callback
 */
app.get('/login', (req, res, next) => {
  //Get the authorization code
  let authCode = req.query.code;
  //Use the authorization code to request an access token
  axios
    .post(process.env.authTokenURL, {
      client_id: process.env.clientID,
      client_secret: process.env.clientSecret,
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: process.env.redirectCallback,
    })
    //Set the access token && the refresh token
    .then((response) => {
      req.session.accessToken = response.data.access_token;
      req.session.refreshToken = response.data.refresh_token;
      res.redirect('/');
    })
    .catch((err) => {
      res.send(err);
    });
});

/**
 * STEP 4: USE THE ACCESS TOKEN
 * Make a call to the Lever API using the access token
 */
app.get('/opportunities', (req, res, next) => {
  axios
    .get(`${process.env.baseURL}opportunities`, {
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`,
      },
      responseType: 'json',
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

/**
 * STEP 5: USE REFRESH TOKEN TO REFRESH AN ACCESS TOKEN AND GET A NEW REFRESH TOKEN
 * Repeat this call based on expiry returned with the access token to maintain persistent authentication
 */
app.get('/refresh', (req, res, next) => {
  axios
    .post(process.env.authTokenURL, {
      client_id: process.env.clientID,
      client_secret: process.env.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: req.session.refreshToken,
    })
    .then((response) => {
      req.session.accessToken = response.data.access_token;
      req.session.refreshToken = response.data.refresh_token;
    })
    .catch((err) => {
      res.send(err);
    });
});

app.listen(process.env.port, () => {
  console.log(`Example app listening at http://localhost:${process.env.port}`);
});
