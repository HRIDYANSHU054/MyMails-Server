import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import dotenv from "dotenv";

// import { User } from "../models/User.model.js";

dotenv.config();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //     return done(err, user);
      //   });

      /*const user = await User.findOne({ username: profile.name });
      if (!user) {
        //user does not exists
        //this is a new user, sign them up
        const newUser = new User({
          emailId: profile.id,
          username: profile.name, 
        });

        await newUser.save();

        done(null, newUser);
        //first arg is error if any
        //second is payload
      } else {
        //user already exists
        //login them
        done(null, user);
      } */

      return done(null, { profile,  accessToken });
    }
  )
);
