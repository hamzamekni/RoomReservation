const jwt = require('jsonwebtoken')

const authenticate = (req,res,next) => {
    const token  = req.cookies.token;
    if( !token ){ 
        return res.status(401).send('Authentication failedddd:invalid token')
    }
    try{
        const tokenData = token.split('.')[1] // Bearer xxxxxx
        req.userId=tokenData._id;
        next()
    }catch (error){
        res.status(401).send('Authentifcation failedd :invalid token')
    }
} 

module.exports = authenticate;