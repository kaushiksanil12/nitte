import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

function Home() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container>
          <SecurityIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            Digital Shield Academy
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Master Cybersecurity Through Interactive Learning
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mt: 4 }}
          >
            Start Learning Now
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          What You'll Learn
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <EmailIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" component="h3" gutterBottom>
                  Phishing Spotter
                </Typography>
                <Typography>
                  Learn to identify and avoid dangerous phishing emails through interactive simulations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <VpnKeyIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" component="h3" gutterBottom>
                  MFA Setup Guide
                </Typography>
                <Typography>
                  Master the setup of Multi-Factor Authentication to protect your accounts.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <PhoneIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" component="h3" gutterBottom>
                  Scam Recognizer
                </Typography>
                <Typography>
                  Learn to spot and avoid common phone and SMS scams through practical scenarios.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Ready to Strengthen Your Digital Security?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
            >
              Sign Up Free
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;