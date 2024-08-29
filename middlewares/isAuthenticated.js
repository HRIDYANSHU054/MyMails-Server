// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page( on the client side i.e. on the React App).
export function isAuthenticated(req, resp, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  resp.redirect(process.env.CLIENT_BASE_URL + "/signup"); 
}
