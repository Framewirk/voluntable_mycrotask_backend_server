const JWT = require('jsonwebtoken')
const createError = require('http-errors')

module.exports = {
    signAccessToken: (uid) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '5h',
                issuer: 'Voluntable',
                audience: uid
            }
            JWT.sign(payload,secret,options,(err, token) => {
                if (err){
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken: async (req, res, next) => {
        if(!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const token = authHeader.split(' ')[1]
        // var checkblacklist = await Blacklist.findOne({accessToken:token})
        // if(!checkblacklist){
            JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
                if(err){
                    const message = err.name === 'JsonWebTokenError'? 'Unauthorized' : err.name;
                    return next(createError.Unauthorized(message))
                }
                req.payload = payload
                next()
            })
        // }else return next(createError.Unauthorized())   
    },
    getTokenData: (token) => {
        return new Promise((resolve, reject) => {
            JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const email = payload.aud

                resolve(email)
            })
        })
    }
}