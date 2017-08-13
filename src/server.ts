/**
 * Module dependencies.
 */
import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo";
import * as flash from "express-flash";
import * as path from "path";
import mongoose = require("mongoose");
import * as passport from "passport";
import * as bluebird from "bluebird";
import expressValidator = require("express-validator");
// impoty { express } from "express";

const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env.example" });

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from "./config/passport";

class Server {

  public async init() {

    const db = await this.database();
    const app = await this.configure();
    /**
     * Start Express server.
     */
    app.listen(app.get("port"), () => {
      console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
      console.log("  Press CTRL-C to stop\n");
    });
  }


  public async database() {
    /**
     * Connect to MongoDB.
     */
    mongoose.Promise = bluebird;
    mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
    mongoose.connection.on("error", () => {
      console.log("MongoDB connection error. Please make sure MongoDB is running.");
      process.exit();
    });
    return mongoose.connection.db;
  }


  public async configure(): Promise<express.Express> {
    /**
     * Create Express server.
     */
    const app = express();
    /**
     * Express configuration.
     */
    app.set("port", process.env.PORT || 3000);
    app.set("views", path.join(__dirname, "../views"));
    app.set("view engine", "pug");
    app.use(compression());
    app.use(logger("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressValidator());
    app.use(session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
      store: new MongoStore({
        url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
        autoReconnect: true
      })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(lusca.xframe("SAMEORIGIN"));
    app.use(lusca.xssProtection(true));
    app.use((req, res, next) => {
      res.locals.user = req.user;
      next();
    });
    app.use((req, res, next) => {
      // After successful login, redirect back to the intended page
      if (!req.user &&
          req.path !== "/login" &&
          req.path !== "/signup" &&
          !req.path.match(/^\/auth/) &&
          !req.path.match(/\./)) {
        req.session.returnTo = req.path;
      } else if (req.user &&
          req.path == "/account") {
        req.session.returnTo = req.path;
      }
      next();
    });
    app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

    /**
     * Index router.
     */
    const routes = await import("./routes");
    app.use("", routes.router);

    /**
     * Error Handler. Provides full stack - remove for production
     */
    app.use(errorHandler());
    return app;
  }

}

new Server().init();