// passport-config.ts
import * as passportLocal from "passport-local";
import passport from "passport";
import UserModel from "../model/user.model";

const LocalStrategy = passportLocal.Strategy;

passport.use(
   new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
         const user = await UserModel.findOne({
            email,
         });
         if (!user) {
            return done(null, false, { message: "Incorrect email." });
         }

         console.log("user", user.password, password);

         const isValidPassword = await UserModel.comparePassword(
            password,
            user.password
         );

         console.log("isValidPassword", isValidPassword);
         if (!isValidPassword) {
            return done(null, false, { message: "Incorrect password." });
         }
         return done(null, user);
      }
   )
);

passport.serializeUser((user: any, done) => {
   done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
   console.log("id", id);
   const user = await UserModel.findById(id);
   done(null, user);
});

export default passport;
