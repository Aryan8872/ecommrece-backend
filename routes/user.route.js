import { Router } from "express";
import { createUserController, deleteUser, getAllUsers, getUserById, loginController, updateUserController } from "../controller/user.controller.js";

const userRouter = Router()

userRouter.post("/user/create",createUserController)

userRouter.post("/user/login",loginController)

userRouter.get("/user/all",getAllUsers)

userRouter.delete("/user/delete/:id",deleteUser)

userRouter.get("/user/detail/:id",getUserById)

userRouter.put("/user/update/:id",updateUserController)

export default userRouter