const express = require("express");
const taskRouter = express.Router();

const { createTask, createTasks, getNewTasks, getMyTasks, getPublishedTasks, updateStatus } = require("../controllers/task");
const { verifyAccessToken } = require("../helpers/jwt");

taskRouter.get("/mytasks", verifyAccessToken, getMyTasks);
taskRouter.post("/addtask", verifyAccessToken, createTask);
taskRouter.post("/addtasks", verifyAccessToken, createTasks);

taskRouter.get("/mypublishedtasks", verifyAccessToken, getPublishedTasks)
taskRouter.patch("/updatestatus", verifyAccessToken, updateStatus)

taskRouter.get("/", verifyAccessToken, getNewTasks);

module.exports = taskRouter;