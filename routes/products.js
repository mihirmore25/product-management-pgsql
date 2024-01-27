import express from "express";
const router = express.Router();
import {
    getAddProduct,
    addProduct,
    getProducts,
    getProduct,
    getUpdateProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.js";
import { protect } from "../middleware/protect.js";

router.get("/", protect, getProducts);
router.get("/addProduct", protect, getAddProduct);
router.get("/:id", protect, getProduct);
router.post("/", protect, addProduct);
router
    .route("/:id/updateProduct", protect)
    .get(getUpdateProduct)
    .post(updateProduct);
// router.post("/:id/delete", deleteProduct);
router.get("/:id/delete", protect, deleteProduct);

export default router;
