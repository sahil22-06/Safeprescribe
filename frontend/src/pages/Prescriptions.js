import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const Prescriptions = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Mock data - in a real app, this would come from an API
  const prescriptions = [
    {
      id: 1,
      patientName: 'John Smith',
      medication: 'Lisinopril 10mg',
      dosage: '1 tablet daily',
      quantity: 30,
      refills: 3,
      prescribedDate: '2024-01-15',
      expiryDate: '2024-04-15',
      status: 'Active',
      interactions: [],
    },
    {
      id: 2,
      patientName: 'Sarah Johnson',
      medication: 'Metformin 500mg',
      dosage: '1 tablet twice daily',
      quantity: 60,
      refills: 2,
      prescribedDate: '2024-01-10',
      expiryDate: '2024-03-10',
      status: 'Active',
      interactions: ['Warfarin'],
    },
    {
      id: 3,
      patientName: 'Mike Davis',
      medication: 'Warfarin 5mg',
      dosage: '1 tablet daily',
      quantity: 30,
      refills: 1,
      prescribedDate: '2024-01-08',
      expiryDate: '2024-02-08',
      status: 'Pending Review',
      interactions: ['Metformin', 'Aspirin'],
    },
    {
      id: 4,
      patientName: 'Emily Wilson',
      medication: 'Atorvastatin 20mg',
      dosage: '1 tablet at bedtime',
      quantity: 30,
      refills: 4,
      prescribedDate: '2024-01-12',
      expiryDate: '2024-04-12',
      status: 'Active',
      interactions: [],
    },
    {
      id: 5,
      patientName: 'Robert Brown',
      medication: 'Amlodipine 5mg',
      dosage: '1 tablet daily',
      quantity: 30,
      refills: 2,
      prescribedDate: '2024-01-05',
      expiryDate: '2024-03-05',
      status: 'Expired',
      interactions: [],
    },
  ];

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (prescription = null) => {
    setSelectedPrescription(prescription);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'Active': { color: 'success', icon: <CheckCircleIcon /> },
      'Pending Review': { color: 'warning', icon: <ScheduleIcon /> },
      'Expired': { color: 'error', icon: <WarningIcon /> },
    };

    const config = statusConfig[status] || { color: 'default', icon: <CheckCircleIcon /> };

    return (
      <Chip
        label={status}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };



  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Prescriptions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Prescription
        </Button>
      </Box>

      <Paper elevation={2}>
        <Box p={3}>
          <Grid container spacing={2} alignItems="center" mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search prescriptions by patient or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  {filteredPrescriptions.length} prescriptions found
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Medication</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Refills</TableCell>
                  <TableCell>Prescribed Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrescriptions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((prescription) => (
                    <TableRow key={prescription.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {prescription.patientName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {prescription.medication}
                          </Typography>
                          {prescription.interactions.length > 0 && (
                            <Chip
                              label={`${prescription.interactions.length} interactions`}
                              color="warning"
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{prescription.dosage}</TableCell>
                      <TableCell>{prescription.quantity}</TableCell>
                      <TableCell>{prescription.refills}</TableCell>
                      <TableCell>{prescription.prescribedDate}</TableCell>
                      <TableCell>{getStatusChip(prescription.status)}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(prescription)}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(prescription)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPrescriptions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      {/* Prescription Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPrescription ? 'Edit Prescription' : 'New Prescription'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  label="Patient"
                  defaultValue={selectedPrescription?.patientName || ''}
                >
                  <MenuItem value="John Smith">John Smith</MenuItem>
                  <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                  <MenuItem value="Mike Davis">Mike Davis</MenuItem>
                  <MenuItem value="Emily Wilson">Emily Wilson</MenuItem>
                  <MenuItem value="Robert Brown">Robert Brown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medication"
                defaultValue={selectedPrescription?.medication || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dosage"
                defaultValue={selectedPrescription?.dosage || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                defaultValue={selectedPrescription?.quantity || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Refills"
                type="number"
                defaultValue={selectedPrescription?.refills || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prescribed Date"
                type="date"
                defaultValue={selectedPrescription?.prescribedDate || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                multiline
                rows={3}
                placeholder="Special instructions for the patient..."
              />
            </Grid>
          </Grid>

          {selectedPrescription && selectedPrescription.interactions.length > 0 && (
            <Card sx={{ mt: 2, bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography variant="h6" color="warning.dark" gutterBottom>
                  <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Drug Interactions
                </Typography>
                <Typography variant="body2" color="warning.dark">
                  This medication may interact with: {selectedPrescription.interactions.join(', ')}
                </Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedPrescription ? 'Update' : 'Create'} Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prescriptions; 