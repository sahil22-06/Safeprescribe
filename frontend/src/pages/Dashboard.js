import React from 'react';
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
} from '@mui/material';
import {
  People as PeopleIcon,
  Medication as MedicationIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Patients',
      value: '1,247',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1976d2',
    },
    {
      title: 'Active Prescriptions',
      value: '89',
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32',
    },
    {
      title: 'Medications',
      value: '156',
      icon: <MedicationIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#0288d1',
    },
    {
      title: 'Pending Reviews',
      value: '12',
      icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ed6c02',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New prescription created',
      patient: 'John Smith',
      medication: 'Lisinopril 10mg',
      time: '2 hours ago',
      status: 'active',
    },
    {
      id: 2,
      action: 'Prescription renewed',
      patient: 'Sarah Johnson',
      medication: 'Metformin 500mg',
      time: '4 hours ago',
      status: 'active',
    },
    {
      id: 3,
      action: 'Medication interaction warning',
      patient: 'Mike Davis',
      medication: 'Warfarin 5mg',
      time: '6 hours ago',
      status: 'warning',
    },
    {
      id: 4,
      action: 'Patient consultation completed',
      patient: 'Emily Wilson',
      medication: 'Atorvastatin 20mg',
      time: '1 day ago',
      status: 'completed',
    },
  ];

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
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {activity.action}
                            </Typography>
                            {getStatusChip(activity.status)}
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {activity.patient} - {activity.medication}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
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
                />
                <Chip
                  label="Create Prescription"
                  color="primary"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                />
                <Chip
                  label="Review Interactions"
                  color="warning"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
                />
                <Chip
                  label="Generate Reports"
                  color="info"
                  variant="outlined"
                  clickable
                  sx={{ justifyContent: 'flex-start', height: 48 }}
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