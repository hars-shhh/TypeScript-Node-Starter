import { Request, Response, NextFunction } from "express";

class HomeController {
  public async index(req: Request, res: Response, next: NextFunction) {
    return res.render("home");
  }
}
export const homeController = new HomeController();
