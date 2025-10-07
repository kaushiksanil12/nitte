import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [statsResponse, leaderboardResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/progress/stats', { headers }),
          axios.get('http://localhost:5000/api/progress/leaderboard', { headers })
        ]);

        setStats(statsResponse.data);
        setLeaderboard(leaderboardResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
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
                      <TrophyIcon color="primary" />
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

        {/* Module Progress */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Module Progress
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats.moduleProgress).map(([moduleId, data]) => (
                <Grid item xs={12} sm={6} md={4} key={moduleId}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {moduleId.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={data.score}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {data.score}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Correct: {data.correctAnswers}/{data.totalAttempts} attempts
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Stats and Badges */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Stats
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <StarIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Phishing Emails Identified"
                  secondary={stats.stats.phishingEmailsIdentified}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Scam Calls Avoided"
                  secondary={stats.stats.scamCallsAvoided}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimerIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Time Spent"
                  secondary={formatTime(stats.totalTimeSpent)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Defenders
            </Typography>
            <List>
              {leaderboard.slice(0, 5).map((user, index) => (
                <React.Fragment key={user.email}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: index === 0
                            ? '#FFD700'
                            : index === 1
                              ? '#C0C0C0'
                              : index === 2
                                ? '#CD7F32'
                                : theme.palette.primary.main
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={user.email}
                      secondary={`Level ${user.level} • ${user.points} Points`}
                    />
                    <Box display="flex" alignItems="center">
                      <GradeIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {user.badgeCount}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < leaderboard.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;