const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require("../models/userModel");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let existingUser  = await User.findOne({ googleId: profile.id });
      if (existingUser ) {
        return done(null, existingUser );
      }

      const newUser  = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        u_role: 'janitor', // Default role
        status: 'active',
        verified: true,
      });

      await newUser .save();
      done(null, newUser );
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser ((user, done) => {
  done(null, user._id);
});

passport.deserializeUser ((id, done) => {
  User.findById(id).then(user => done(null, user)).catch(err => done(err, null));
});
