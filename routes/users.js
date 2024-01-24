import express from "express";
import {
    addUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from "../controllers/user.js";

const router = express.Router();

router.post("/addUser", addUser);
router.get("/getUsers", getUsers);
router.get("/:id", getUser);
router.post("/:id", updateUser);
router.post("/:id/delete", deleteUser);

export default router;
