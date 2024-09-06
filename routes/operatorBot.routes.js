import { Router } from "express";
import * as operatorBotControllers from "../controllers/operatorBot.controllers.js";

const router = Router();

router.route("/telegram").post(operatorBotControllers.handlerTelegram);

export default router;
