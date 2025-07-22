import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Medication as MedicationIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { patientsAPI, drugsAPI, prescriptionsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState([
    {
      title: 'Total Patients',
      value: '0',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1976d2',
    },
    {
      title: 'Active Prescriptions',
      value: '0',
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32',
    },
    {
      title: 'Medications',
      value: '0',
      icon: <MedicationIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#0288d1',
    },
    {
      title: 'Pending Reviews',
      value: '0',
      icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ed6c02',
    },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsStats, drugsStats, prescriptionsStats, prescriptionsList] = await Promise.all([
          patientsAPI.getStats(),
          drugsAPI.getStats(),
          prescriptionsAPI.getStats(),
          prescriptionsAPI.getAll({ limit: 5 })
        ]);

        setStats([
          {
            title: 'Total Patients',
            value: patientsStats.data.total_patients.toString(),
            icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: '#1976d2',
          },
          {
            title: 'Medications',
            value: drugsStats.data.total_drugs.toString(),
            icon: <MedicationIcon sx={{ fontSize: 40, color: 'info.main' }} />,
            color: '#0288d1',
          },
          {
            title: 'Active Prescriptions',
            value: prescriptionsStats.data.active_prescriptions.toString(),
            icon: <ReceiptIcon sx={{ fontSize: 40, color: 'success.main' }} />,
            color: '#2e7d32',
          },
          {
            title: 'Completed Prescriptions',
            value: prescriptionsStats.data.completed_prescriptions.toString(),
            icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
            color: '#0288d1',
          },
          {
            title: 'Expired Prescriptions',
            value: prescriptionsStats.data.expired_prescriptions.toString(),
            icon: <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />,
            color: '#ed6c02',
          },
          {
            title: 'Cancelled Prescriptions',
            value: prescriptionsStats.data.cancelled_prescriptions.toString(),
            icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
            color: '#ed6c02',
          },
          {
            title: 'Pending Prescriptions',
            value: prescriptionsStats.data.pending_prescriptions.toString(),
            icon: <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
            color: '#ed6c02',
          },
          {
            title: 'Total Prescriptions',
            value: prescriptionsStats.data.total_prescriptions.toString(),
            icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: '#1976d2',
          },
        ]);

        setRecentActivity(prescriptionsList.data.results || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Optionally, clear stats and recentActivity on unmount
    return () => {
      setStats([]);
      setRecentActivity([]);
    };
  }, []);



  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'completed':
        return <ScheduleIcon color="info" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'warning':
        return <Chip label="Warning" color="warning" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="info" size="small" />;
      default:
        return <Chip label="Active" color="success" size="small" />;
    }
  };

  return (
    <Box>
      {/* User Info Section */}
      {user && (
        <Card elevation={3} sx={{ maxWidth: 400, mb: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 28 }}>
              {(user.full_name || user.username || user.email || 'D')[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">
                {user.full_name || user.username || user.email || 'Doctor'}
              </Typography>
              {user.email && (
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              )}
              {user.role && (
                <Chip label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} color="primary" size="small" sx={{ mt: 0.5 }} />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          {getStatusIcon(activity.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" fontWeight="medium">
                                Prescription for {activity.patient_details?.full_name}
                              </Typography>
                              {getStatusChip(activity.status)}
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {activity.drug_details?.name} - {activity.dosage}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(activity.prescribed_date).toLocaleDateString()}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary">
                          No recent activity
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Chip
                  label="Add New Patient"
                  color="primary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                  onClick={() => navigate('/patients')}
                />
                <Chip
                  label="Create Prescription"
                  color="primary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                  onClick={() => navigate('/prescriptions')}
                />
                <Chip
                  label="Review Interactions"
                  color="warning"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                  onClick={() => navigate('/medications')}
                />
                <Chip
                  label="Generate Reports"
                  color="info"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                  onClick={() => navigate('/')}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 