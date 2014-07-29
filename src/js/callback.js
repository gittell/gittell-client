var querystring = require('querystring');
var AccessToken = require('./models/access-token');

var hash = location.href.split('#')[1];

if (hash) {
  var params = querystring.parse(hash);
  AccessToken.set(params.access_token);
  if (window.opener) {
	  window.close();
  } else {
  	location.href = "/";
  }
}