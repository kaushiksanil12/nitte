import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import SmsIcon from '@mui/icons-material/Sms';
import axios from 'axios';

const scenarios = [
  {
    id: 1,
    type: 'sms',
    title: 'Bank Alert SMS',
    content: 'URGENT: Your bank account has been suspended. Click here to reactivate: http://short.ly/bank-verify',
    options: [
      {
        text: 'Click the link to check your account',
        isCorrect: false,
        explanation: "Never click on links in unexpected SMS messages claiming to be from your bank. Banks typically do not send account alerts via SMS with links."
      },
      {
        text: 'Ignore and delete the message',
        isCorrect: true,
        explanation: 'Good choice! This is a classic smishing attempt. Banks will never ask you to click on links via SMS to verify your account.'
      }
    ]
  },
  {
    id: 2,
    type: 'phone',
    title: 'Tech Support Call',
    content: 'Caller claims to be from Microsoft Support and says your computer has been infected with a virus. They need remote access to fix it.',
    options: [
      {
        text: 'Allow remote access to fix the problem',
        isCorrect: false,
        explanation: "Microsoft will never call you unsolicited about virus infections. This is a common tech support scam."
      },
      {
        text: 'Hang up immediately',
        isCorrect: true,
        explanation: "Excellent! This is a classic tech support scam. Legitimate tech companies do not make unsolicited calls about computer problems."
      }
    ]
  },
  {
    id: 3,
    type: 'sms',
    title: 'Package Delivery SMS',
    content: 'Your package is waiting for delivery. Pay $2.99 shipping fee: http://tracking.delivery-status.net',
    options: [
      {
        text: 'Pay the small fee to receive your package',
        isCorrect: false,
        explanation: "Legitimate delivery services do not ask for additional fees via SMS links. This is a scam to steal your payment information."
      },
      {
        text: 'Delete the message and check official tracking',
        isCorrect: true,
        explanation: 'Perfect! Always verify delivery status through official carrier websites using your tracking number.'
      }
    ]
  }
];

function ScamRecognizer() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleAnswer = async (isCorrect, explanation) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    setFeedback({
      isCorrect,
      explanation
    });
    setShowFeedback(true);

    if (currentScenario === scenarios.length - 1) {
      try {
        await axios.post('http://localhost:5000/api/progress/module-complete', {
          moduleId: 'scam-recognizer',
          score: score + (isCorrect ? 1 : 0)
        });
        setCompleted(true);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setShowFeedback(false);
    }
  };

  const scenario = scenarios[currentScenario];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Scam Recognizer
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Learn to identify and avoid common phone and SMS scams
      </Typography>

      {/* Progress */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Progress: {currentScenario + 1} / {scenarios.length}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(currentScenario / scenarios.length) * 100}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          Score: {score}
        </Typography>
      </Box>

      {/* Scenario Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {scenario.type === 'phone' ? (
              <PhoneIcon color="primary" sx={{ mr: 1 }} />
            ) : (
              <SmsIcon color="primary" sx={{ mr: 1 }} />
            )}
            <Typography variant="h6" component="h2">
              {scenario.title}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {scenario.content}
          </Typography>

          {!showFeedback && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {scenario.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="large"
                  onClick={() => handleAnswer(option.isCorrect, option.explanation)}
                >
                  {option.text}
                </Button>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback && !completed} onClose={handleNext}>
        <DialogTitle>
          {feedback?.isCorrect ? 'Correct!' : 'Incorrect'}
        </DialogTitle>
        <DialogContent>
          <Alert
            severity={feedback?.isCorrect ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {feedback?.explanation}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNext}>
            {currentScenario === scenarios.length - 1 ? 'Finish' : 'Next Scenario'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={completed}>
        <DialogTitle>Module Completed!</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations! You've completed the Scam Recognizer module.
            Final Score: {score} out of {scenarios.length}
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

export default ScamRecognizer;