require('dotenv').config()

const mongoose = require('mongoose')
const mongodb = require('mongodb')
const { Readable } = require('stream')

//model
const Project = require('../model/Project')

//middleware
const auth = require('./auth-service')

//utils
const { logLevel, getNextSequence, generateUniqueName, base64ImageString, logError } = require('../utils/myUtils')

//Constants
const PREVIEWS_COLLECTION =  "previews.files"

const saveProject = (data) => { }


//@desc SAVE PROJECT IMAGES
//@param previews from Client, update flag(to check new or already existing)
const saveProjectImage = async (previews, update = false, project = null) => {
    const PREVIEWS_BUCKET = new mongodb.GridFSBucket(mongoose.connection.db, {
        bucketName: 'previews'
    })

    const fileCollection = mongoose.connection.db.collection(PREVIEWS_COLLECTION)

    ////remove pcitures if Update
    if (update && project !== null) {
        project.previews.forEach(prev => {
            fileCollection.find({ filename: prev }).toArray((err, data) => {
                data.forEach(dat => {
                    PREVIEWS_BUCKET.delete(dat._id, (err) => {
                        console.log("deleted previous images")
                    })
                })
            })   
        })
    }

    //add new images
    const previewImageNames = previews.map(preview => generateUniqueName(preview.originalname));
    
    for (let preview of previews){
        const readablePhotoStream = new Readable();
        readablePhotoStream.push(preview.buffer);
        readablePhotoStream.push(null);
        
        readablePhotoStream.pipe(PREVIEWS_BUCKET.openUploadStream(generateUniqueName(preview.originalname)))
        .on('error', (error) => {
            return res.status(500).send(error.message + '<<<<<' )
        })
        .on('finish', () => {
            console.log('Successfully uploaded img')
        })
    }
   
    return previewImageNames
}


//@desc GET PROJECT BASSE64 IMAGES
//@param PROJECT
const getProjectImages = async (project) => {

    const imagesNames = project.previews.map(preview => preview);

    const chunksCollection =  mongoose.connection.db.collection("previews.chunks")

    const collection = mongoose.connection.db.collection(PREVIEWS_COLLECTION)

    var base64Images = []

    for(let prev of imagesNames){
        const ress = await collection.find({ "filename": prev }).toArray()

        var ext = ress[0].filename.split('.')[1]
        const chunks = await chunksCollection.find({ "files_id": mongoose.Types.ObjectId(ress[0]._id) }).toArray()

        var chunksJSON = JSON.parse(JSON.stringify(chunks))

        let chunksData = ''
        if (chunksJSON.length > 1){
            chunksJSON.forEach(chun => {
                chunksData += chun.data
            });
        }else{
            chunksData = chunksJSON[0].data
        }
        base64Images.push(base64ImageString(chunksData, ext))
    }

    project = JSON.parse(JSON.stringify(project))
    project.base64Images = base64Images

    return project
}


//@desc DELETE PROJECT SERVICE
//@param PROJECT
const deleteProject = async (project) => {
    const PREVIEWS_BUCKET = new mongodb.GridFSBucket(mongoose.connection.db, {
        bucketName: 'previews'
    })

    const previews = project.previews

    if (previews) {
        for (let preview of previews){
            mongoose.connection.db.collection('previews.files', (err, fileCollection) => {
                logError(err)
    
                fileCollection.find({filename: preview}).toArray((err, data) => {
    
                    logError(err)
    
                    data.forEach(data => {
                        PREVIEWS_BUCKET.delete(data._id, (err) => {
                           logError(err)
                            console.log("Delete succesful")
                        })
                    })
                })
            })
        }
    }

    await project.remove();
}


//@desc DELETE PROJECT SERVICE
//@param Project preview imageName
const deleteProjectImageByName = async (imageName) => {
    const PREVIEWS_BUCKET = new mongodb.GridFSBucket(mongoose.connection.db, {
        bucketName: 'previews'
    })
    let filecollection = mongoose.connection.db.collection(PREVIEWS_COLLECTION)
    filecollection.find({filename: imageName}).toArray((err, data) => {
        logError(err)
        data.forEach(data => {
            PREVIEWS_BUCKET.delete(data._id, (err) => {
                logError(err)
            })
        })
    })
}

const getAllProjects = () => { }

module.exports = {
    saveProjectImage,
    saveProject,
    getAllProjects,
    getProjectImages,
    deleteProjectImageByName,
    deleteProject
}