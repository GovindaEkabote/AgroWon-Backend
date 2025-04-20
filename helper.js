var {expressjwt : jwt} = require('express-jwt')

function authJwt() {
    const secret = process.env.TOKEN;
    return jwt({
        secret:secret,
        algorithms:['HS256']
    })
}

module.exports =authJwt;