require("dotenv").config();
require("./src/helpers/db");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRouter = require("./src/routes/user");
const taskRouter = require("./src/routes/task");
const certRouter = require("./src/routes/certificate");

const { logger } = require("./src/middleware/log");

const app = express();
const port = process.env.PORT || 5000;

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(logger);

app.use("/v1/user", userRouter);
app.use("/v1/task", taskRouter);
app.use("/v1/certificate", certRouter);

app.listen(port, () => {
    console.log("Server Running Live on Port : " + port);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        }
    })
})

app.get('/', async (req, res) => {
    var data = req.body;
    res.send(data)
});