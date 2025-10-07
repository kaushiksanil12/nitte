import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

// Sample phishing emails (in real app, these would come from the backend)
const sampleEmails = [
  {
    id: 1,
    subject: 'Urgent: Your Account Will Be Suspended',
    from: 'security@bankservice.com',
    content: 'Dear Customer, Your account will be suspended within 24 hours. Click here to verify your information immediately.',
    isPhishing: true,
    explanation: "This is a phishing attempt because it creates urgency and asks you to click a suspicious link. Legitimate banks do not send such urgent emails about account suspension."
  },
  {
    id: 2,
    subject: 'Your Recent Amazon Order #12345',
    from: 'order-update@amazon.com',
    content: 'Thank you for your order. Track your package or view your order details on Amazon.com',
    isPhishing: false,
    explanation: "This is a legitimate email because it uses a proper Amazon domain, does not ask for personal information, and directs you to the official website."
  },
  {
    id: 3,
    subject: 'Payment Received - PayPal',
    from: 'service@paypa1.com',
    content: "You have received a payment of $750.00 USD. Log in to your account to claim this payment within 24 hours: http://paypa1.com/claim",
    isPhishing: true,
    explanation: 'This is a phishing attempt. Notice the misspelled domain "paypa1.com" (using the number "1" instead of the letter "l"). Legitimate PayPal emails come from @paypal.com.'
  },
  {
    id: 4,
    subject: 'Google Sign-in attempt blocked',
    from: 'no-reply@accounts.google.com',
    content: "We detected a sign-in attempt from a new device. If this was not you, please review your account activity at https://myaccount.google.com/security",
    isPhishing: false,
    explanation: "This is legitimate. It directs to the official Google domain and does not ask for credentials via email. Instead, it asks you to visit your account security page."
  },
  {
    id: 5,
    subject: 'Inheritance Notification!!!',
    from: 'barrister.john@lawyermail.net',
    content: 'DEAR BENEFICIARY, I am Barrister John representing the estate of a deceased client who shares your surname. Contact me immediately to claim your inheritance of $4.5M USD.',
    isPhishing: true,
    explanation: 'This is a classic inheritance scam. Red flags include excessive punctuation, ALL CAPS text, unrealistic money promises, and urgency to respond.'
  },
  {
    id: 6,
    subject: 'Microsoft 365 Subscription Renewal',
    from: 'billing@microsoft.com',
    content: 'Your Microsoft 365 subscription will renew on 05/15/2024. View your subscription details or manage your renewal settings at https://account.microsoft.com/services',
    isPhishing: false,
    explanation: 'This is legitimate. It uses the correct Microsoft domain, provides specific account information, and directs to the official Microsoft account portal.'
  }
];

function PhishingSpotter() {
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [completed, setCompleted] = useState(false);

  const currentEmail = sampleEmails[currentEmailIndex];

  const handleAnswer = async (isPhishingGuess) => {
    const isCorrect = isPhishingGuess === currentEmail.isPhishing;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setFeedbackType({
      correct: isCorrect,
      explanation: currentEmail.explanation
    });
    setShowFeedback(true);

    // If this was the last email
    if (currentEmailIndex === sampleEmails.length - 1) {
      try {
        // Update progress on backend
        await axios.post('http://localhost:5000/api/progress/module-complete', {
          moduleId: 'phishing-spotter',
          score: score + (isCorrect ? 1 : 0)
        });
        setCompleted(true);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleNext = () => {
    if (currentEmailIndex < sampleEmails.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1);
      setShowFeedback(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Phishing Spotter
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Learn to identify phishing emails by analyzing real-world examples
      </Typography>

      {/* Progress indicator */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Progress: {currentEmailIndex + 1} / {sampleEmails.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Score: {score}
        </Typography>
      </Box>

      {/* Email display */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText
              primary={`From: ${currentEmail.from}`}
              secondary={`Subject: ${currentEmail.subject}`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={currentEmail.content}
              sx={{ whiteSpace: 'pre-wrap' }}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Action buttons */}
      {!showFeedback && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleAnswer(false)}
          >
            Legitimate Email
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAnswer(true)}
          >
            Phishing Attempt
          </Button>
        </Box>
      )}

      {/* Feedback dialog */}
      <Dialog open={showFeedback} onClose={handleNext}>
        <DialogTitle>
          {feedbackType?.correct ? 'Correct!' : 'Incorrect'}
        </DialogTitle>
        <DialogContent>
          <Alert
            icon={feedbackType?.correct ? <CheckCircleIcon /> : <WarningIcon />}
            severity={feedbackType?.correct ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {feedbackType?.explanation}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNext}>
            {currentEmailIndex === sampleEmails.length - 1 ? 'Finish' : 'Next Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion dialog */}
      <Dialog open={completed}>
        <DialogTitle>Module Completed!</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations! You've completed the Phishing Spotter module.
            Final Score: {score} out of {sampleEmails.length}
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

export default PhishingSpotter;