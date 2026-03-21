import express from "express";
import { createAccountValidation, loginValidation } from "../middlewares/authValidation.js";
import authController from "../controllers/authController.js";
const router = express.Router();

router.route('/auth/create-account').post(createAccountValidation, authController.createAccount);
router.route('/auth/login').post(loginValidation, authController.login);
router.route('/auth/logout').post(authController.logout);

export default router;