const router = require('express').Router();
const { auth } = require('../middleware/auth-service');
const { check } = require('express-validator')

//controller 
const authController = require('../controllers/authController')


//@route    GET api/auth
//@desc     Authenticate User
//@access   private
router.get('/', auth, authController.get)


//@route    POST api/auth
//@desc     (LOGIN) Authenticate user and get JWT token
//@access   private
router.post(
  '/',
  [
    check('email', 'Please include a valid email address' ).isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min : 6})
  ],
  authController.post.Login
)


// @route    POST api/user
// @desc     Register user account
// @access   Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.post.Register
);

module.exports = router;