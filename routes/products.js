import express from "express";
const router = express.Router();
import {
    addProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.js";

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", addProduct);
router.post("/:id", updateProduct);
router.post("/:id/delete", deleteProduct);

export default router;
