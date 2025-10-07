const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    progress: {
        completedModules: [{
            type: String,
            enum: ['phishing-spotter', 'mfa-setup', 'scam-recognizer']
        }],
        moduleProgress: {
            'phishing-spotter': {
                score: { type: Number, default: 0 },
                correctAnswers: { type: Number, default: 0 },
                totalAttempts: { type: Number, default: 0 },
                lastAttemptDate: Date
            },
            'mfa-setup': {
                score: { type: Number, default: 0 },
                correctAnswers: { type: Number, default: 0 },
                totalAttempts: { type: Number, default: 0 },
                lastAttemptDate: Date
            },
            'scam-recognizer': {
                score: { type: Number, default: 0 },
                correctAnswers: { type: Number, default: 0 },
                totalAttempts: { type: Number, default: 0 },
                lastAttemptDate: Date
            }
        },
        points: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        },
        badges: [{
            id: String,
            name: String,
            description: String,
            imageUrl: String,
            earnedAt: Date
        }],
        achievements: [{
            id: String,
            name: String,
            description: String,
            progress: Number,
            completed: Boolean,
            earnedAt: Date
        }],
        stats: {
            phishingEmailsIdentified: { type: Number, default: 0 },
            scamCallsAvoided: { type: Number, default: 0 },
            mfaSetupCompleted: { type: Number, default: 0 },
            totalTimeSpent: { type: Number, default: 0 }, // in minutes
            loginStreak: { type: Number, default: 0 },
            lastLoginDate: Date
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);