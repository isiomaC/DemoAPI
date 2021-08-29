const { validationResult } = require('express-validator')

//service
const UserService = require('../middleware/user-service')

//utils
const { setTokenCookie, getNextSequence, sanitizeModel, parseError } = require('../utils/myUtils')


const authControler = {

    get: async (req, res) => {
        try{
          const user = await UserService.getUser(req.user.id)
          return res.status(200).json({
            success: true,
            data : {
              ...UserService.basicDetails(user),
            }
          })
        }catch(e){
          console.log(e)
          return res.status(400).json({
            success: false, 
            error: {
              message : parseError(error) 
            }
          });
        }
    },

    post: {
        Login: async (req, res) =>{

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }
        
            const { email, password } = req.body;
            const ipaddress = req.ip
        
            UserService.authenticate({email, password, ipaddress})
            .then(({refreshToken, jwtToken, ...user}) => {
              setTokenCookie(res, refreshToken)
    
              return res.status(200).json({
                success: true,
                token: jwtToken,
                data : {
                  ...user
                }
              })
            }).catch((error) => {
              return res.status(400).json({
                success: false, 
                error: { message : parseError(error) }
              });
            })
        },

        Register: () => {
            async (req, res) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(404).json({ errors: errors.array() });
                }
                
                try {
                  const { email, password, password2 } = req.body;
                  const ipaddress = req.ip
              
                  UserService.registerUser({email, password, password2, ipaddress})
                    .then( async ({jwtToken, ...user}) => {
              
                        const tk = jwtToken
                        return res.status(200).json({
                            success: true,
                            token: jwtToken,
                            data: {
                            ...user
                            }
                        })
                    }).catch((error) => {
                        return res.status(400).json({
                            success: false,
                            error: {
                                message : error.message
                            }
                        });
                    })
                } catch (error) {
                  return res.status(500).json({ 
                      success: false,
                      error: { 
                          message: error 
                      } 
                  });
                }
            }
        }
    },

}

module.exports = authControler