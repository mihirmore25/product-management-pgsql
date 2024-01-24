import express from "express";
import { addUser, getUsers, getUser, updateUser } from "../controllers/user.js";

const router = express.Router();

router.post("/addUser", addUser);
router.get("/getUsers", getUsers);
router.get("/:id", getUser);
router.post("/:id", updateUser);

export default router;
