import { Request, Response, NextFunction } from "express";

class UserController {

  public async index(req: Request, res: Response, next: NextFunction) {

  }

}

export const userController = new UserController();
