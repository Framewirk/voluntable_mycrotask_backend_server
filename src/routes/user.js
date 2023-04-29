const express = require("express");
const userRouter = express.Router();

const { createLoginUser, acceptTask, rejectTask, employerCreateLoginUser, createTask, pushSubscribe } = require("../controllers/user");
const { verifyAccessToken } = require("../helpers/jwt");

userRouter.post("/login", createLoginUser);
userRouter.post("/employerlogin", employerCreateLoginUser);

userRouter.patch("/acceptTask", verifyAccessToken, acceptTask);
userRouter.post("/createTask", verifyAccessToken, createTask);
userRouter.patch("/rejectTask", verifyAccessToken, rejectTask);

userRouter.post("/subscribe", verifyAccessToken, pushSubscribe);

module.exports = userRouter;