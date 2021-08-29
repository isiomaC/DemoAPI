const mongodb = require('mongodb')
const mongoose = require('mongoose')
const { Readable } = require('stream');

const { validationResult } = require('express-validator')

//service
const ProjectService = require('../middleware/project-service')
const { setTokenCookie, getNextSequence, sanitizeModel, parseError } = require('../utils/myUtils')

const projectController = {

    get: async (req, res)=>{
        try{
            const project = await Project.find({},{date: 0, __v: 0})
    
            if (!project || project.length <= 0){
                return res.status(400).json({ 
                    success: false,
                    data: null,
                    error: ['No projects Exist, Please create with a post request to /api/v1/project']
                })
            }
    
            return res.status(200).json({
                success: true,
                data: project,
                error : null
            })
        }catch(err){
            console.log(err)
            return res.status(500).json({
                success: false,
                data: null,
                error : "Server Error.."
            })
        }
    },

    getById: async (req, res)=>{
        try{
            const project = await Project.findById(req.params.projectid, {date: 0, __v: 0})

            if (!project) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error : ['Projects does not exist']
                })
            }

            return res.status(200).json({
                success: true,
                data: project,
                error : null
            })
        }catch(err){
            console.log(err);
            return res.status(500).json({
                success: false,
                data: null,
                error : "Server Error.."
            })
        }
    },

    getByImageName: async (req, res)=>{
        try{
            const project = await Project.find({_id : req.params.projectid})
    
            const exists = project[0].previews.filter(preview => preview == req.params.imagename)
    
            var previewsBucket = new mongodb.GridFSBucket(mongoose.connection.db, {
                bucketName: 'previews'
            })
            
            var bufs = []
            if (exists.length > 0){
                let download = previewsBucket.openDownloadStreamByName(req.params.imagename)
    
                download.on('data', (chunk) => {
                    bufs.push(chunk)
                }).on('error' , (error) => {
                    res.status(404).send(error.message + '')
                }).on('end', () => {
                    var buffa = Buffer.concat(bufs)
                    var base64 = buffa.toString('base64')
                    return res.status(200).json({
                        success: true,
                        data: base64,
                        error : null
                    })
                })
            }else{
                return res.status(404).json({'error': 'Image does not Exist'})
            }
    
        }catch(err){
            console.log(err.message);
            return res.status(500).json({
                success: false,
                data: null,
                error : "Server Error.."
            })
        }
    },

    post: async (req, res) => {
        const errors = validationResult(req, res);
        if (!errors.isEmpty()){
            return res.status(400).json({ error: errors.array() });
        }
        try{
            const photos = req.files['previews']
    
            const photoNames = photos.map(photo => 
                photo.originalname
            )
    
            var previewsBucket = new mongodb.GridFSBucket(mongoose.connection.db, {
                bucketName: 'previews'
            })
    
            for(let photo of photos){
                const readablePhotoStream = new Readable();
                readablePhotoStream.push(photo.buffer);
                readablePhotoStream.push(null);
                readablePhotoStream.pipe(previewsBucket.openUploadStream(photo.originalname))
                .on('error', (error) => {
                    res.status(500).send(error.message + '<<<<<' )
                })
                .on('finish', () => {
                    console.log('Successfully uploaded img')
                })
            }
    
            const project = new Project({
                name: req.body.name,
                description: req.body.description,
                previews: photoNames
            });
    
            const newProject = await project.save()
        
            return res.status(201).json({
                sucess: true,
                data: newProject,
                error: null
            });
    
        }catch (err){
            return res.status(500).json({
                success: false,
                data: null,
                error : "Server Error.."
            })
        }
    },

    delete: async (req, res) => {
        try{
            const project = await Project.findById(req.params.id)
            if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !project) {
                return res.status(404).json({ msg: 'Project not found' });
            }
    
            var previewsBucket = new mongodb.GridFSBucket(mongoose.connection.db, {
                bucketName: 'previews'
            })

            const previews = project.previews

            if (previews){
                for (let preview of previews){

                    const collection = await mongoose.connection.db.collection('previews.files')

                    if (collection){
                        const data = await collection.find({filename: preview}).toArray()
                        console.log(data)

                        if (data){
                            for (let dt of data){
                                previewsBucket.delete(dt._id, (err) => {
                                    console.log("Chunk and file deleted succesfully")
                                })
                            }
                        }
                    }
                }
            }
            
            await project.remove();

            return res.json({
                success: true,
                message : "Project Deleted"
            })
    
        }catch(err){
            console.log(err.message);
            return res.status(500).json({
                success: false,
                error : "Server Error.."
            })
        }
    }

}

module.exports = projectController