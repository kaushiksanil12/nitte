import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  useTheme,
  CircularProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PhoneIcon from '@mui/icons-material/Phone';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GradeIcon from '@mui/icons-material/Grade';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!user?.isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/progress/leaderboard');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, navigate]);

  const modules = [
    {
      id: 'phishing-spotter',
      title: 'Phishing Spotter',
      description: 'Learn to identify and avoid dangerous phishing emails.',
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      path: '/modules/phishing-spotter'
    },
    {
      id: 'mfa-setup',
      title: 'MFA Setup Guide',
      description: 'Master Multi-Factor Authentication setup and usage.',
      icon: <VpnKeyIcon sx={{ fontSize: 40 }} />,
      path: '/modules/mfa-setup'
    },
    {
      id: 'scam-recognizer',
      title: 'Scam Recognizer',
      description: 'Learn to spot and avoid common phone and SMS scams.',
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      path: '/modules/scam-recognizer'
    }
  ];

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user?.stats) {
    return (
      <Container>
        <Typography color="error">Failed to load dashboard data. Please try again later.</Typography>
      </Container>
    );
  }

  const stats = user.stats;

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* User Level and Points */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: theme.palette.primary.main,
              color: 'white'
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.light,
                mb: 2
              }}
            >
              <SecurityIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              Level {stats.level}
            </Typography>
            <Typography variant="h6">
              {stats.points} Points
            </Typography>
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(stats.points % 1000) / 10}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="caption" sx={{ mt: 1 }}>
              {1000 - (stats.points % 1000)} points to next level
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Achievements
            </Typography>
            <List>
              {stats.achievements
                .filter(achievement => achievement.completed)
                .slice(0, 3)
                .map((achievement) => (
                  <ListItem key={achievement.id}>
                    <ListItemIcon>
                      <EmojiEventsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.name}
                      secondary={achievement.description}
                    />
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>

        {/* Learning Modules */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Learning Modules
            </Typography>
            <Grid container spacing={2}>
              {modules.map((module) => {
                const moduleProgress = stats.moduleProgress[module.id] || {};
                const isCompleted = stats.completedModules?.includes(module.id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={module.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {module.icon}
                          {isCompleted && (
                            <Badge
                              color="success"
                              badgeContent="✓"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {module.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {module.description}
                        </Typography>
                        {moduleProgress.score !== undefined && (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={moduleProgress.score}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {moduleProgress.score}%
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Correct: {moduleProgress.correctAnswers}/{moduleProgress.totalAttempts} attempts
                            </Typography>
                          </>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(module.path)}
                        >
                          {isCompleted ? 'Review Module' : 'Start Learning'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        {/* User Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Phishing Emails Identified"
                  secondary={stats.stats.phishingEmailsIdentified}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Scam Calls Avoided"
                  secondary={stats.stats.scamCallsAvoided}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <VpnKeyIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="MFA Setups Completed"
                  secondary={stats.stats.mfaSetupCompleted}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimerIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Time Learning"
                  secondary={formatTime(stats.stats.totalTimeSpent)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Learners
            </Typography>
            <List>
              {leaderboard.map((entry, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {index < 3 ? (
                      <StarIcon color={index === 0 ? 'warning' : 'primary'} />
                    ) : (
                      <GradeIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={entry.email}
                    secondary={`Level ${entry.level} • ${entry.points} Points • ${entry.badgeCount} Badges`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;