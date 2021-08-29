const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const { auth } =  require('../middleware/auth-service')

//Controller
const projectController = require('../controllers/projectController')

//Multer
const multer = require('multer')
const memStorgae = multer.memoryStorage()
var upload = multer({storage: memStorgae, limits: {paths: 2, fieldSize: 6000000 , fields: 2, files: 10 }}).fields([{name:'previews'}])


// @route GET /projects
// @desc Get all projects..
router.get('/', auth, projectController.get)


// @route GET /projects/:projectId
// @desc Get single project by id
router.get('/:projectid', auth, projectController.getById)


// @route GET /projects/:projectid/:imagename
// @desc Get and display Single Preview Image in a project By name
router.get('/:projectid/:imagename', auth, projectController.getByImageName )


// @route POST /projects
// @desc Post a project with preview images... imagelimit: 10
router.post('/', auth, upload,
[
    check('name', 'name is required').notEmpty(),
    check('description', 'description is required').notEmpty(),
    check('previews').custom((value, { req } ) => {
        let returnVal;
        for(let preview of req.files.previews){
            if (preview.originalname.match(/.(jpg|jpeg|png)$/i)){
                returnVal = true //'.pdf'; 
            }else {
                returnVal = false
                break;
            }
        }
        return returnVal
    }).withMessage('Please submit a valid image(.jpeg /.jpg / .png)')
],
projectController.post)


// @route DELETE /projects/:projectId
// @desc Delete single project by Id 
router.delete('/:id', auth, projectController.delete)


const logError =(err) => {
    if (err){
        console.log(err.message)
    }
}

module.exports = router;