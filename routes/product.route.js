import { Router } from "express";
import { createProductController, deleteProductController, getAllProductController, getProductByIdController, updateProductController } from "../controller/product.controller.js";
import { authorizeRoles, verifyToken } from "../middleware/auth.js";
import upload from "../utls/multer.js";

const productRouter = Router();

// Public: list and view products
productRouter.get("/product/all", authorizeRoles("user"), getAllProductController);
productRouter.get("/product/detail/:id", getProductByIdController);

// Authenticated (user or admin): create, update, delete
productRouter.post("/product/new", verifyToken, upload.single("image"), createProductController);
productRouter.put("/product/update/:id", verifyToken, upload.single("image"), updateProductController);
productRouter.delete("/product/delete/:id", verifyToken, deleteProductController);

export default productRouter;
