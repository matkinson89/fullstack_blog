const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');
const jwt =  require('jsonwebtoken');
const secret = require('../app').secret;

const userSchema = new Schema({
    // username: {
    //     type: String,
    //     unique: true,
    //     required: [true, 'Username is required'],
    //     index: true
    // },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 
        'is invalid']
    },
    firstName: {
        type: String,
        required: [true, 'Firstname is required']
    },
    lastName: {
        type: String,
        required: [true, 'Lastname is required']
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        select: false
    },
    role: {
        type: String,
        enum: ['guest', 'user'],
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    hash: String,
    salt: String
})

// Encrypt passwords
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hashSync(this.password, salt);
});

// Generate JWT
userSchema.methods.generateJWT = function() {
    return jwt.sign({
        id: this._id },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRE}, secret)
};

// Match entered password with db password
userSchema.methods.validPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to reset resetPasswordToken field
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

userSchema.plugin(uniqueValidator, {message: 'is already taken.'})

module.exports = mongoose.model('User', userSchema);
