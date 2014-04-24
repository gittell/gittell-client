/* global process */
module.exports = {
  apiBaseUrl: process.env.API_SERVER_URL + "/api",
  client: {
    clientId: "chromeExtension",
    authzUrl: process.env.AUTHZ_SERVER_URL + "/oauth2/authorize"
  }
};