const express = require("express");
const certRouter = express.Router();

const { getMyCertificates, getCertificate, issueCompletion, getCerts, searchCertificates } = require("../controllers/certificate");
const { verifyAccessToken } = require("../helpers/jwt");

certRouter.get("/mycerts", verifyAccessToken, getMyCertificates);
certRouter.post("/issueCompletion", verifyAccessToken, issueCompletion);
certRouter.post("/getCerts", verifyAccessToken, getCerts);
certRouter.get("/cert/:certificateId", getCertificate);
certRouter.post("/search", searchCertificates);


module.exports = certRouter;