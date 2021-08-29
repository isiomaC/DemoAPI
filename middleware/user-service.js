const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const mongoose = require('mongoose')

const User = require('../model/User')
const RefreshToken = require('../model/RefreshToken')


require('dotenv').config()
const secret = process.env.JWTSECRET
const { getNextSequence, encrypt } = require('../utils/myUtils')

const authenticate = async ({ email, password, ipAddress }) => {

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user){
        throw "Username or password is incorrect"
    }

    const isMatch =  await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw 'Username or password is incorrect';
    }

    const jwtToken = generateJwtToken(user);

    return { 
        ...details(user._doc),
        jwtToken : encrypt(jwtToken),
    };
}


const registerUser = async ({email, password, password2, ipAddress }) => {

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
       throw 'User already exist'
    }

    if (password !== password2){
        throw 'Passwords must match'
    } 

    const seq = await getNextSequence(mongoose.connection.db, 'userId')
    
    user = new User({
        uid: seq,
        email: email.toLowerCase(),
        password,
    });

    // const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, 10);

    await user.save();

    const jwtToken = generateJwtToken(user);

    // return basic details and tokens
    return { 
        ...details(user),
        jwtToken : encrypt(jwtToken),
    };

}

async function getAll() {
    const users = await User.find();
    return users.map(x => details(x));
}

async function getById(id) {
    const user = await getUser(id);
    return details(user);
}

async function getUser(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw 'User not found';
    const user = await User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

const generateJwtToken = (user) => {
    const tk = jwt.sign({ sub: user.id, id: user.id }, secret, { expiresIn: '3h' });
    return tk
}

const details = (user) => {
    const { uid, email, isAdmin } = user;
    return { uid, email, isAdmin };
}

module.exports = {
    authenticate,
    getAll,
    getById,
    getUser,
    generateJwtToken,
    details,
    registerUser
};