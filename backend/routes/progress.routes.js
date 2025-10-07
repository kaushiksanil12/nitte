const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verified.userId;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// Get user progress
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress', error: error.message });
    }
});

// Update progress when module is completed
router.post('/module-complete', authenticateToken, async (req, res) => {
    try {
        const { moduleId, score, correctAnswers, totalAttempts, timeSpent } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update module progress
        user.progress.moduleProgress[moduleId] = {
            score,
            correctAnswers,
            totalAttempts,
            lastAttemptDate: new Date()
        };

        // Add module to completed modules if not already completed
        if (!user.progress.completedModules.includes(moduleId)) {
            user.progress.completedModules.push(moduleId);
        }

        // Update points and stats
        const pointsEarned = calculatePoints(score, correctAnswers, totalAttempts);
        user.progress.points += pointsEarned;
        user.progress.totalTimeSpent += timeSpent;

        // Update specific module stats
        switch (moduleId) {
            case 'phishing-spotter':
                user.progress.stats.phishingEmailsIdentified += correctAnswers;
                break;
            case 'scam-recognizer':
                user.progress.stats.scamCallsAvoided += correctAnswers;
                break;
            case 'mfa-setup':
                user.progress.stats.mfaSetupCompleted += 1;
                break;
        }

        // Update level
        user.progress.level = calculateLevel(user.progress.points);

        // Check and award badges
        const earnedBadges = checkForBadges(user.progress);
        earnedBadges.forEach(badge => {
            if (!user.progress.badges.some(b => b.id === badge.id)) {
                user.progress.badges.push({
                    ...badge,
                    earnedAt: new Date()
                });
            }
        });

        // Check and update achievements
        const achievements = checkForAchievements(user.progress);
        achievements.forEach(achievement => {
            const existingAchievement = user.progress.achievements.find(a => a.id === achievement.id);
            if (existingAchievement) {
                existingAchievement.progress = achievement.progress;
                existingAchievement.completed = achievement.completed;
                if (achievement.completed && !existingAchievement.earnedAt) {
                    existingAchievement.earnedAt = new Date();
                }
            } else {
                user.progress.achievements.push({
                    ...achievement,
                    earnedAt: achievement.completed ? new Date() : null
                });
            }
        });

        await user.save();
        res.json({
            progress: user.progress,
            pointsEarned,
            newBadges: earnedBadges,
            achievements: achievements.filter(a => a.completed)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress', error: error.message });
    }
});

// Helper function to calculate points based on performance
function calculatePoints(score, correctAnswers, totalAttempts) {
    const basePoints = score * 10;
    const accuracyBonus = (correctAnswers / totalAttempts) * 50;
    const speedBonus = totalAttempts === 1 ? 25 : 0;
    return Math.round(basePoints + accuracyBonus + speedBonus);
}

// Helper function to calculate level based on points
function calculateLevel(points) {
    return Math.floor(points / 1000) + 1;
}

// Helper function to check for badges
function checkForBadges(progress) {
    const earnedBadges = [];

    // Module mastery badges
    const moduleThresholds = {
        'phishing-spotter': { id: 'phishing-expert', name: 'Phishing Expert', threshold: 90 },
        'mfa-setup': { id: 'mfa-master', name: 'MFA Master', threshold: 85 },
        'scam-recognizer': { id: 'scam-detective', name: 'Scam Detective', threshold: 90 }
    };

    Object.entries(progress.moduleProgress).forEach(([moduleId, data]) => {
        const threshold = moduleThresholds[moduleId];
        if (threshold && data.score >= threshold.threshold) {
            earnedBadges.push({
                id: threshold.id,
                name: threshold.name,
                description: `Achieved mastery in ${moduleId} with a score of ${data.score}%`,
                imageUrl: `/badges/${threshold.id}.png`
            });
        }
    });

    // Achievement-based badges
    if (progress.stats.phishingEmailsIdentified >= 50) {
        earnedBadges.push({
            id: 'phishing-hunter',
            name: 'Phishing Hunter',
            description: 'Successfully identified 50 phishing attempts',
            imageUrl: '/badges/phishing-hunter.png'
        });
    }

    if (progress.stats.scamCallsAvoided >= 30) {
        earnedBadges.push({
            id: 'scam-shield',
            name: 'Scam Shield',
            description: 'Protected yourself from 30 scam calls',
            imageUrl: '/badges/scam-shield.png'
        });
    }

    if (progress.stats.mfaSetupCompleted >= 3) {
        earnedBadges.push({
            id: 'mfa-guardian',
            name: 'MFA Guardian',
            description: 'Set up MFA on 3 different platforms',
            imageUrl: '/badges/mfa-guardian.png'
        });
    }

    return earnedBadges;
}

// Helper function to check for achievements
function checkForAchievements(progress) {
    const achievements = [
        {
            id: 'security-novice',
            name: 'Security Novice',
            description: 'Complete your first module',
            progress: progress.completedModules.length,
            completed: progress.completedModules.length >= 1
        },
        {
            id: 'security-expert',
            name: 'Security Expert',
            description: 'Complete all modules with a score of 80% or higher',
            progress: Object.values(progress.moduleProgress).filter(m => m.score >= 80).length,
            completed: Object.values(progress.moduleProgress).every(m => m.score >= 80)
        },
        {
            id: 'perfect-defender',
            name: 'Perfect Defender',
            description: 'Achieve 100% score in any module',
            progress: Object.values(progress.moduleProgress).some(m => m.score === 100) ? 1 : 0,
            completed: Object.values(progress.moduleProgress).some(m => m.score === 100)
        },
        {
            id: 'consistent-learner',
            name: 'Consistent Learner',
            description: 'Maintain a 7-day login streak',
            progress: progress.stats.loginStreak,
            completed: progress.stats.loginStreak >= 7
        }
    ];

    return achievements;
}

// Add route to get leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        const leaderboard = await User.find({}, 'email progress.points progress.level progress.badges')
            .sort({ 'progress.points': -1 })
            .limit(10);

        res.json(leaderboard.map(user => ({
            email: user.email,
            points: user.progress.points || 0,
            level: user.progress.level || 1,
            badgeCount: user.progress.badges?.length || 0
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
    }
});

// Add route to get detailed user stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize progress if it doesn't exist
        if (!user.progress) {
            user.progress = {
                points: 0,
                level: 1,
                completedModules: [],
                moduleProgress: {},
                badges: [],
                achievements: [],
                stats: {
                    phishingEmailsIdentified: 0,
                    scamCallsAvoided: 0,
                    mfaSetupCompleted: 0,
                    totalTimeSpent: 0,
                    loginStreak: 0,
                    lastLoginDate: new Date()
                },
                totalTimeSpent: 0
            };
            await user.save();
        }

        const stats = {
            moduleProgress: user.progress.moduleProgress || {},
            level: user.progress.level || 1,
            points: user.progress.points || 0,
            badges: user.progress.badges || [],
            achievements: user.progress.achievements || [],
            stats: user.progress.stats || {
                phishingEmailsIdentified: 0,
                scamCallsAvoided: 0,
                mfaSetupCompleted: 0,
                totalTimeSpent: 0,
                loginStreak: 0,
                lastLoginDate: new Date()
            },
            completedModules: user.progress.completedModules || [],
            totalTimeSpent: user.progress.totalTimeSpent || 0
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

module.exports = router;