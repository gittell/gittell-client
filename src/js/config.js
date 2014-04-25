/* global process */
module.exports = {
  authzServerUrl: process.env.AUTHZ_SERVER_URL,
  apiBaseUrl: process.env.API_SERVER_URL + "/api",
  client: {
    clientId: "chromeExtension",
    authzUrl: process.env.AUTHZ_SERVER_URL + "/oauth2/authorize",
    revokeUrl: process.env.AUTHZ_SERVER_URL + "/oauth2/revoke"
  }
};