module.exports = {
  get: function() {
    return localStorage.getItem('meetell_access_token');
  },
  set: function(accessToken) {
    return localStorage.setItem('meetell_access_token', accessToken);
  },
  getAuthorizationHeader: function() {
    return {
      Authorization: "Bearer "+this.get()
    };
  }
};