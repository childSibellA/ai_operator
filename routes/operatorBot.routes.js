import { Router } from "express";
import * as instagramOperatorBotControllers from "../controllers/instagramOperatorBot.controllers.js";
import * as facebookOperatorBotControllers from "../controllers/facebookOperatorBot.controllers.js";

const router = Router();

// router.route("/telegram").post(operatorBotControllers.handlerTelegram);
router.route("/facebook").post(facebookOperatorBotControllers.handlerFacebook);
router
  .route("/instagram")
  .post(instagramOperatorBotControllers.handlerInstagram);

export default router;
