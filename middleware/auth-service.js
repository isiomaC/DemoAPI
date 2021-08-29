const jwt = require('jsonwebtoken');

// Models
const User = require('../model/User')
const RefreshToken = require('../model/RefreshToken')

require('dotenv').config()

const { decrypt, logLevel } = require('../utils/myUtils')

const auth = async (req, res, next) => {
  const secret = process.env.JWTSECRET

  // Get token string from header
  var token = req.header('Authorization') ? req.header('Authorization').split(' ')[1] : req.header('x-auth-token');

  // Check if not token exists
  if (!token || token === null) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  //verifytoken with jsonwebtoken
  try {
        const decryptedToken = decrypt(token)
        await jwt.verify(decryptedToken, secret, async (error, decoded) => {
            if(error){
              if (error.message === 'jwt expired'){
                return res.status(401).json({ success: false, msg: error.message });
              }

              if (error.message === 'invalid signature'){
                return res.status(401).json({ success: false, msg: 'Invalid Authorization Token' });
              }

              return res.status(401).json({ success: false, msg: 'Invalid Authorization Token' });
            }
            
            req.user = {}
            req.user.id = decoded.id
        
            const user = await User.findById(req.user.id)

            if (!user){
              return res.status(401).json({ msg: 'User not found' })
            }else{
              const refreshToken = RefreshToken.find({user: user._id})
              req.user.ownsToken = token => !!refreshToken.find(x => x.token === token);
            }
            next();
        });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

module.exports =  { 
  auth
}