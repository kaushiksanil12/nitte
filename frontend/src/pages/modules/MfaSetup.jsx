import { useState } from 'react';
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  Box,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';

const steps = [
  {
    label: 'Understanding MFA',
    description: 'Multi-Factor Authentication (MFA) adds an extra layer of security to your accounts by requiring two or more verification methods.',
    content: `MFA typically combines:
    1. Something you know (password)
    2. Something you have (phone or security key)
    3. Something you are (fingerprint or face)`,
    quiz: {
      question: 'Which of these is NOT typically used as an MFA factor?',
      options: [
        'Your email address',
        'Your fingerprint',
        'A code from an authenticator app',
        'A security key'
      ],
      correctAnswer: 0
    }
  },
  {
    label: 'Choosing an Authentication Method',
    description: 'Learn about different MFA methods and choose the best one for your needs.',
    content: `Common MFA methods:
    • Authenticator Apps (Google Authenticator, Microsoft Authenticator)
    • SMS codes
    • Security Keys (YubiKey)
    • Biometric authentication`,
    quiz: {
      question: 'Which MFA method is generally considered the most secure?',
      options: [
        'SMS codes',
        'Security keys',
        'Email codes',
        'Recovery codes'
      ],
      correctAnswer: 1
    }
  },
  {
    label: 'Setting Up an Authenticator App',
    description: 'Practice setting up an authenticator app in this simulation.',
    content: `Steps to set up an authenticator app:
    1. Download the authenticator app
    2. Scan the QR code or enter the setup key
    3. Enter the generated code to verify setup
    4. Save backup codes in a secure location`,
    quiz: {
      question: 'What should you do with backup codes?',
      options: [
        'Share them with trusted friends',
        'Store them in your email',
        'Save them securely offline',
        'Post them on social media'
      ],
      correctAnswer: 2
    }
  }
];

function MfaSetup() {
  const [activeStep, setActiveStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleNext = () => {
    setShowQuiz(true);
  };

  const handleQuizAnswer = async (selectedAnswer) => {
    const isCorrect = selectedAnswer === steps[activeStep].quiz.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setQuizAnswer({ selected: selectedAnswer, isCorrect });

    if (activeStep === steps.length - 1) {
      try {
        await axios.post('http://localhost:5000/api/progress/module-complete', {
          moduleId: 'mfa-setup',
          score: score + (isCorrect ? 1 : 0)
        });
        setCompleted(true);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleContinue = () => {
    setQuizAnswer(null);
    setShowQuiz(false);
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MFA Setup Guide
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Learn how to secure your accounts with Multi-Factor Authentication
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Progress: {activeStep + 1} / {steps.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Score: {score}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="h6">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {step.description}
                </Typography>
                <Typography
                  variant="body1"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    my: 2
                  }}
                >
                  {step.content}
                </Typography>
              </Paper>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Quiz Dialog */}
      <Dialog open={showQuiz && !quizAnswer} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Check</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {steps[activeStep].quiz.question}
          </Typography>
          <Box sx={{ mt: 2 }}>
            {steps[activeStep].quiz.options.map((option, index) => (
              <Button
                key={index}
                fullWidth
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => handleQuizAnswer(index)}
              >
                {option}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={!!quizAnswer && !completed} maxWidth="sm" fullWidth>
        <DialogTitle>
          {quizAnswer?.isCorrect ? 'Correct!' : 'Incorrect'}
        </DialogTitle>
        <DialogContent>
          <Alert
            severity={quizAnswer?.isCorrect ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {quizAnswer?.isCorrect
              ? 'Great job! You understand this concept well.'
              : `The correct answer was: ${
                  steps[activeStep].quiz.options[steps[activeStep].quiz.correctAnswer]
                }`}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContinue}>Continue</Button>
        </DialogActions>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={completed}>
        <DialogTitle>Module Completed!</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations! You've completed the MFA Setup Guide module.
            Final Score: {score} out of {steps.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button href="/dashboard" color="primary">
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MfaSetup;