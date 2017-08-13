import { Request, Response, NextFunction } from "express";
import * as passport from "passport";
import { IUser } from "../models";
import { LocalStrategyInfo } from "passport-local";
class AuthController {

  public async login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", (err: Error, user: IUser, info: LocalStrategyInfo) => {
      if (err)  return next(err);
      if (!user) {
        return res.redirect("/login");
      }
      return res.redirect("/home");
    });
  }

}
export const authController = new AuthController();