// import * as gapi from "https://apis.google.com/js/api.js"
//  const { gapi } = require('googleapis');

// // CLIENT KEYS
// const { client_secret, client_id, redirect_uris } = require('../../auth/googleCredentialsOAuth.json').web;

// const SCOPES = [
//     'https://www.googleapis.com/auth/drive'
// ];
// // The file token.json stores the user's access and refresh tokens, and is
// // created automatically when the authorization flow completes for the first
// // time.
// let { DRIVE_TOKEN } = require("../../auth/token.json");;

// let { oAuth2Client, drive } = authenticate(DRIVE_TOKEN);


// function getLoginURL(redirect_uri) {
//     let oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
//     return oAuth2Client.generateAuthUrl({
//         access_type: 'online',
//         scope: SCOPES,
//     });
// }

// async function getToken(driveCode) {
//     try {
//         let oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
//         const drive_token = await oAuth2Client.getToken(driveCode);
//         return { oAuth2Client, drive_token };
//     } catch (error) {
//         throw { error };
//     }
// }



// function authenticate(drive_token, oAuth2Client, redirect_uri = redirect_uris[0]) {
//     // Authorized OAuth2 client
//     if (!oAuth2Client) oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
//     oAuth2Client.setCredentials(drive_token);

//     // Includes all the functions/requests to google drive
//     let drive = google.drive({ version: 'v3', auth: oAuth2Client });

//     return { oAuth2Client, drive };
// }


// // --------------------------------Refresh Tokens and update drive
// async function refreshToken() {
//     try {
//         let { data, status } = (await oAuth2Client.getAccessToken()).res;

//         if (status === 200) {
//             DRIVE_TOKEN = data;
//             oAuth2Client.setCredentials(DRIVE_TOKEN);

//             drive = google.drive({ version: 'v3', auth: oAuth2Client });
//         }
//     } catch (error) {
//         throw error;
//     }
// }


// function refreshTokenRepeatedly() {
//     try {
//         setInterval(async () => {
//             refreshToken();
//         }
//             , 2700000);
//     } catch (error) {
//         console.log("setContinuesConnection", error);
//         reject(error);
//     }
// }

// refreshTokenRepeatedly();


// module.exports = { drive, authenticate, getToken, getLoginURL };



 // Client ID and API key from the Developer Console
 var CLIENT_ID = '900448899123-cvpufbc6uuk12vfq04u6k08kdkp5srlq.apps.googleusercontent.com';
 var API_KEY = 'AIzaSyBnuGiT-UbbKbl8vAY1q6ZOCxaQaHx0SMY';

 // Array of API discovery doc URLs for APIs used by the quickstart
 var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

 // Authorization scopes required by the API; multiple scopes can be
 // included, separated by spaces.
 var SCOPES = 'https://www.googleapis.com/auth/drive';

 window.addEventListener("initGapi",()=>{
    handleClientLoad()
 })
  /**
       *  On load, called to load the auth2 library and API client library.
       */
  export  function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
      debugger
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      debugger
    //   authorizeButton.onclick = handleAuthClick;
    //   signoutButton.onclick = handleSignoutClick;
    }, function(error) {
      appendPre(JSON.stringify(error, null, 2));
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
    //   authorizeButton.style.display = 'none';
    //   signoutButton.style.display = 'block';
      listFiles();
    } else {
    //   authorizeButton.style.display = 'block';
    //   signoutButton.style.display = 'none';
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  function appendPre(message) {
    // var pre = document.getElementById('content');
    // var textContent = document.createTextNode(message + '\n');
    // pre.appendChild(textContent);
    console.log(message)
  }

  /**
   * Print files.
   */
  function listFiles() {
    gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name)"
    }).then(function(response) {
      appendPre('Files:');
      var files = response.result.files;
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          appendPre(file.name + ' (' + file.id + ')');
        }
      } else {
        appendPre('No files found.');
      }
    });
  }

