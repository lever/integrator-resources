const example = {};

example.loginButton = document.getElementById('loginButton');
example.opportunitiesButton = document.getElementById('opportunitiesButton');
example.resultsParent = document.getElementById('resultsParent');
example.logo = document.getElementById('logo');

/**
 * MOVING PROCESS-DOTENV VARIABLES TO FRONT END!!
 * This is for the convience of only entering your credentials in the process.dotenv
 * No need to duplicate this
 * In your app you can put the redirect directly in an href in your html
 */
example.clientID;
example.redirectCallback;
example.scope;
example.state;
example.baseURL;

document.addEventListener('DOMContentLoaded', function () {
  fetch('/dotenv', { responseType: 'json' })
    .then(function (u) {
      return u.json();
    })
    .then(function (json) {
      const { clientID, redirectCallback, scope, state, baseURL } = json;
      Object.assign(example, {
        clientID,
        redirectCallback,
        scope,
        state,
        baseURL,
      });
    });
});

/**
 * STEP 1: REQUEST USER AUTHORIZATION
 * Redirect your user to log into Lever and authorize your access to the scopes you've requested
 * Response in the backend
 * Here we are using the credentials we got from the response above, in your app you can put the redirect directly into an html href.
 * This is done for the convience of using one location for your credentials.
 */
example.loginButton.addEventListener('click', function () {
  example.login();
});

example.login = function () {
  authURI = `https://sandbox-lever.auth0.com/authorize?client_id=${example.clientID}&redirect_uri=${example.redirectCallback}&state=${example.state}&response_type=code&scope=${example.scope}&prompt=consent&audience=${example.baseURL}`;
  encodedAuthURI = encodeURI(authURI);
  window.location.replace(encodedAuthURI);
};

/**
 * STEP 4: USE ENDPOINT
 * Call the API with the access token
 */
example.results = [];

example.opportunitiesButton.addEventListener('click', function () {
  example.requestOpportunities();
});

example.requestOpportunities = function () {
  fetch('/opportunities', { responseType: 'json' })
    .then(function (u) {
      return u.json();
    })
    .then(function (json) {
      example.results = json.data;
    })
    .then(() => {
      example.displayResults();
    });
};

/**
 * Display results of endpoint call on the DOM
 */
example.displayResults = function () {
  function createResult(name) {
    let li = document.createElement('li');
    li.textContent = name;
    return li;
  }
  for (const result of example.results) {
    example.resultsParent.appendChild(createResult(result.name));
  }
};
