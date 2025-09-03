import { Router } from "express";
import { createUserController, deleteUser, getAllUsers, getUserById, loginController, updateUserController, logoutController } from "../controller/user.controller.js";
import { verifyToken, authorizeRoles, authorizeSelfOrAdmin } from "../middleware/auth.js";
import upload from "../utls/multer.js";

const userRouter = Router();

// Public: Register new user with optional profile image upload
userRouter.post("/user/create", upload.single("profileImage"), createUserController);

// Public: Login
userRouter.post("/user/login", loginController);

// Logout: requires valid token; frontend will clear session/local storage on success
userRouter.post("/user/logout", verifyToken, logoutController);

// Admin only: Get all users
userRouter.get("/user/all", verifyToken, authorizeRoles("admin"), getAllUsers);

// Self or Admin: Delete user by ID
userRouter.delete("/user/delete/:id", verifyToken, authorizeSelfOrAdmin, deleteUser);

// Self or Admin: Get user detail by ID
userRouter.get("/user/detail/:id", verifyToken, authorizeSelfOrAdmin, getUserById);

// Self or Admin: Update user by ID (allow profile image upload). Only admin can change role in controller
userRouter.put("/user/update/:id", verifyToken, authorizeSelfOrAdmin, upload.single("profileImage"), updateUserController);

export default userRouter;
