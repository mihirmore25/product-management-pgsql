import express from "express";
import {
    addUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from "../controllers/user.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/addUser", protect, addUser);
router.get("/getUsers", protect, getUsers);
router.get("/:id", protect, getUser);
router.post("/:id", protect, updateUser);
router.post("/:id/delete", protect, deleteUser);

export default router;
