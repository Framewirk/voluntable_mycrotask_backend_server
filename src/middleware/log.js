const Log = require('../models/log.model');

const logger = async ( req, res, next ) => {
    try {
        let log = await Log.create({
            requestMethod: req.method,
            requestUrl: req.url,
            requestIp: req.ip,
        });
        next();
    } catch (error) {
        console.log(error)
    }
}

module.exports = { logger }