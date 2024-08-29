export function getLogout(req, resp) {
  req.session.destroy((err) => {
    if (err) {
      return console.log("Error logging out: ", err.message);
    }
    resp.status(200).json({ message: "Logged out" });
  });
}
