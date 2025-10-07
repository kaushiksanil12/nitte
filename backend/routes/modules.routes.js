const express = require('express');
const router = express.Router();

// Get all available modules
router.get('/', (req, res) => {
    const modules = [
        {
            id: 'phishing-spotter',
            title: 'Phishing Spotter',
            description: 'Learn to identify and avoid phishing emails.',
            difficulty: 'Beginner',
            estimatedTime: '15 minutes',
            imageUrl: '/modules/phishing.jpg'
        },
        {
            id: 'mfa-setup',
            title: 'MFA Setup Guide',
            description: 'Set up Multi-Factor Authentication for better security.',
            difficulty: 'Intermediate',
            estimatedTime: '20 minutes',
            imageUrl: '/modules/mfa.jpg'
        },
        {
            id: 'scam-recognizer',
            title: 'Scam Recognizer',
            description: 'Learn to identify common phone and SMS scams.',
            difficulty: 'Beginner',
            estimatedTime: '15 minutes',
            imageUrl: '/modules/scam.jpg'
        }
    ];
    
    res.json(modules);
});

// Get specific module by ID
router.get('/:id', (req, res) => {
    const moduleId = req.params.id;
    const modules = {
        'phishing-spotter': {
            id: 'phishing-spotter',
            title: 'Phishing Spotter',
            description: 'Learn to identify and avoid phishing emails.',
            content: {
                introduction: 'This module will teach you how to spot phishing emails.',
                sections: [
                    {
                        title: 'Common Phishing Indicators',
                        content: 'Learn about urgent language, suspicious links, and poor grammar.'
                    },
                    {
                        title: 'Real-world Examples',
                        content: 'Practice with simulated phishing emails.'
                    }
                ]
            }
        },
        'mfa-setup': {
            id: 'mfa-setup',
            title: 'MFA Setup Guide',
            description: 'Set up Multi-Factor Authentication for better security.',
            content: {
                introduction: 'Learn why MFA is important and how to set it up.',
                sections: [
                    {
                        title: 'Understanding MFA',
                        content: 'Learn about different types of authentication factors.'
                    },
                    {
                        title: 'Setup Guide',
                        content: 'Step-by-step guide to enable MFA on common services.'
                    }
                ]
            }
        },
        'scam-recognizer': {
            id: 'scam-recognizer',
            title: 'Scam Recognizer',
            description: 'Learn to identify common phone and SMS scams.',
            content: {
                introduction: 'This module will help you recognize and avoid common scams.',
                sections: [
                    {
                        title: 'Phone Scams',
                        content: 'Learn about tech support scams and fake caller IDs.'
                    },
                    {
                        title: 'SMS Scams',
                        content: 'Identify suspicious text messages and links.'
                    }
                ]
            }
        }
    };

    const module = modules[moduleId];
    if (module) {
        res.json(module);
    } else {
        res.status(404).json({ message: 'Module not found' });
    }
});

module.exports = router;