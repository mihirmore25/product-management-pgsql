import express from "express";
import {
    getLogin,
    getRegister,
    login,
    logout,
    register,
} from "../controllers/auth.js";

const router = express.Router();

router.route("/register").get(getRegister).post(register);
router.route("/login").get(getLogin).post(login);
router.get("/logout", logout);

export default router;
