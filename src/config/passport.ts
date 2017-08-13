import * as passport from "passport";
import * as request from "request";
import * as passportLocal from "passport-local";
import * as passportFacebook from "passport-facebook";
import * as _ from "lodash";
import { Request, Response, NextFunction } from "express";
import { IUser, userModel } from "../models";
const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

passport.serializeUser<IUser, String>((user, done) => done(undefined, user.id));
passport.deserializeUser<IUser, String>((id, done) => {
  userModel.findById(id, (err, user) => {
    if (err) done(err);
    if (user) done(err, user);
    done(new Error("User Not Found"));
  });
});

/**
 * Sign in using Email and Password.
 */
const localStrategy = new LocalStrategy(
  { usernameField: "email" },
  (email, password, done) => {
    userModel.findOne({ email: email.toLowerCase() }, (err, user) => {
      if (err) return done(err);

      if (!user)
        return done(undefined, false, {
          message: `Email ${email} not found.`
        });

      if (user.password === password) return done(undefined, user);
      else {
        return done(undefined, false, {
          message: "Invalid email or password."
        });
      }
    });
  }
);

/**
 * Login Required middleware.
 */
export let isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split("/").slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
