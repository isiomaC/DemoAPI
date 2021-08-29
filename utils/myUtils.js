'use strict'
const CryptoJS = require('crypto-js')
const contentRange = require('content-range')

const logLevel = {
    error: "error",
    info: "info",
    warn: "warn"
}

const decrypt = (data) => {
  if (typeof(data) === "string"){

      return CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data,  process.env.CRYPTO_SECRET, 
          {
              keySize: 128 / 8,
              iv: process.env.CRYPTO_SECRET,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7
          }));
  }
  return JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data,  process.env.CRYPTO_SECRET, 
  {
      keySize: 128 / 8,
      iv: process.env.CRYPTO_SECRET,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })));
}

const encrypt = (data) => {

    let toEncrypt 

    if (typeof(data) === "object" && data !== null){
        toEncrypt = JSON.stringify(data)
    }else{
        toEncrypt = data
    }

    return CryptoJS.AES.encrypt(toEncrypt, process.env.CRYPTO_SECRET,
     {
        keySize: 128 / 8,
        iv: process.env.REACT_APP_SECRET,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
}

const getNextSequence = async (db, name) => {

    const check = await db.collection("counter").find({ _id: name }).toArray()

    //Create if it doesnt exist
    if (!check || check.length === 0){
        const obj = {
            _id : name,
            seq: 1
        }
        await db.collection("counter").insertOne(obj)
    }

    const ret = await db.collection("counter").findOneAndUpdate(
           { _id: name },
           { $inc:
                { seq: 1 }
           },
           {
             new: true,
             upsert: true
           }
    );
    console.log("SEQ IN FUNC", ret.value.seq)
    return ret.value.seq;
}

const setHeaderForPartial =  (res, header, first, limit, length) => {

    header = contentRange.format({
        unit: 'items',
        first: first,
        limit: limit,
        length: length
    })

    console.log(header)

    //sets response headers,
    res.set({
        'Access-Control-Expose-Headers': 'Content-Range',
        'Content-Type': 'application/json', 
        'Content-Range': header
    })
}

const setTokenCookie = (res, token) => {
    // create http only cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}

const generateUniqueName = (name) => {
    const dateAppend = new Date(Date.now()).toLocaleString();
    const append = dateAppend.split("/").join("").split(":").join("").split(",").join("").split(" ").join("-");
    return`${name.split(".")[0]}` +'_'+`${append}` + `.${name.split(".")[1]}`
}

const base64ImageString = (data, ext) =>{
    var base64Flag = `data:image/${ext};charset=utf-8;base64,`
    return base64Flag + data
}

const logError =(err) => {
    if (err){
        console.log(err.message)
    }
}

const parseError = (error) => {
    if (typeof(error) === "string"){
        return error
    }
    return error.message
}

const sanitizeModel = (obj) => {
    let jsObject = JSON.parse(JSON.stringify(obj))
    return {
        ...Object.keys(jsObject).reduce((object, key) => {
            if (key !== '__v' && key !== '_id'){
                object[key] = jsObject[key]
            }
            return object
        },{ })
    }
}

module.exports = {
    decrypt,
    encrypt,
    logLevel,
    getNextSequence,
    setTokenCookie,
    logError,
    generateUniqueName,
    base64ImageString,
    setHeaderForPartial,
    parseError,
    sanitizeModel,
}