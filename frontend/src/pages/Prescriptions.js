import React, { useState, useEffect } from 'react';
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
import { prescriptionsAPI, patientsAPI, drugsAPI } from '../services/api';

function toISODate(dateStr) {
  // Accepts YYYY-MM-DD or DD-MM-YYYY, returns YYYY-MM-DD
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('-');
    return `${y}-${m}-${d}`;
  }
  return dateStr;
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    patient: '',
    drug: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    refills: '',
    instructions: '',
    prescribed_date: '',
    expiry_date: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [allergyWarning, setAllergyWarning] = useState('');

  useEffect(() => {
    fetchAll();
    // Optionally, clear prescriptions state on unmount
    return () => setPrescriptions([]);
  }, []);

  useEffect(() => {
    if (!formData.patient || !formData.drug) {
      setAllergyWarning('');
      return;
    }
    const patient = patients.find((p) => p.id === Number(formData.patient));
    const drug = drugs.find((d) => d.id === Number(formData.drug));
    if (patient && drug && patient.allergies && drug.allergy_conflicts) {
      const patientAllergyIds = patient.allergies.map((a) => a.id);
      const conflictAllergies = drug.allergy_conflicts.filter((a) => patientAllergyIds.includes(a.id));
      if (conflictAllergies.length > 0) {
        setAllergyWarning(
          `Warning: Patient is allergic to: ${conflictAllergies.map((a) => a.name).join(', ')}. This drug may cause an allergic reaction.`
        );
      } else {
        setAllergyWarning('');
      }
    } else {
      setAllergyWarning('');
    }
  }, [formData.patient, formData.drug, patients, drugs]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [presRes, patRes, drugRes] = await Promise.all([
        prescriptionsAPI.getAll(),
        patientsAPI.getAll(),
        drugsAPI.getAll(),
      ]);
      setPrescriptions(presRes.data);
      setPatients(patRes.data);
      setDrugs(drugRes.data);
    } catch (err) {
      setError('Failed to load prescriptions or reference data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const patientName = prescription.patient_details ? `${prescription.patient_details.first_name} ${prescription.patient_details.last_name}`.toLowerCase() : '';
    const drugName = prescription.drug_details ? prescription.drug_details.name.toLowerCase() : '';
    return (
      patientName.includes(searchTerm.toLowerCase()) ||
      drugName.includes(searchTerm.toLowerCase())
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (prescription = null) => {
    setSelectedPrescription(prescription);
    if (prescription) {
      setFormData({
        patient: prescription.patient,
        drug: prescription.drug,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        quantity: prescription.quantity,
        refills: prescription.refills,
        instructions: prescription.instructions,
        prescribed_date: prescription.prescribed_date,
        expiry_date: prescription.expiry_date,
        status: prescription.status,
      });
    } else {
      setFormData({
        patient: '',
        drug: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: '',
        refills: '',
        instructions: '',
        prescribed_date: '',
        expiry_date: '',
        status: 'active',
      });
    }
    setFormError('');
    setAllergyWarning('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
    setFormError('');
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleFormSubmit = async () => {
    setFormLoading(true);
    setFormError('');
    setAllergyWarning('');
    // Frontend validation
    const requiredFields = ['patient', 'drug', 'dosage', 'frequency', 'duration', 'quantity', 'refills', 'prescribed_date', 'expiry_date', 'status'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setFormError(`Please fill in the ${field.replace('_', ' ')} field.`);
        setFormLoading(false);
        return;
      }
    }
    // Validate date format
    const prescribedDate = toISODate(formData.prescribed_date);
    const expiryDate = toISODate(formData.expiry_date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(prescribedDate) || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      setFormError('Dates must be in YYYY-MM-DD format.');
      setFormLoading(false);
      return;
    }
    try {
      const payload = {
        ...formData,
        prescribed_date: prescribedDate,
        expiry_date: expiryDate,
        patient: Number(formData.patient),
        drug: Number(formData.drug),
        status: formData.status.toLowerCase(),
      };
      let response;
      if (selectedPrescription) {
        response = await prescriptionsAPI.update(selectedPrescription.id, payload);
      } else {
        response = await prescriptionsAPI.create(payload);
      }
      // Show backend warning if present
      if (response && response.data && response.data.allergy_warning) {
        setAllergyWarning(response.data.allergy_warning);
      } else {
        setAllergyWarning('');
      }
      fetchAll();
      handleCloseDialog();
    } catch (err) {
      if (err.response && err.response.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join(' ');
        setFormError(messages || 'Failed to save prescription.');
      } else {
        setFormError('Failed to save prescription.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'active': { color: 'success', icon: <CheckCircleIcon /> },
      'pending': { color: 'warning', icon: <ScheduleIcon /> },
      'expired': { color: 'error', icon: <WarningIcon /> },
      'completed': { color: 'default', icon: <CheckCircleIcon /> },
      'cancelled': { color: 'default', icon: <CheckCircleIcon /> },
    };
    const config = statusConfig[status] || { color: 'default', icon: <CheckCircleIcon /> };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">Loading...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" style={{ color: 'red' }}>{error}</TableCell>
                  </TableRow>
                ) : filteredPrescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No prescriptions found.</TableCell>
                  </TableRow>
                ) : (
                  filteredPrescriptions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((prescription) => (
                      <TableRow key={prescription.id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {prescription.patient_details ? `${prescription.patient_details.first_name} ${prescription.patient_details.last_name}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {prescription.drug_details ? prescription.drug_details.name : ''}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>{prescription.quantity}</TableCell>
                        <TableCell>{prescription.refills}</TableCell>
                        <TableCell>{prescription.prescribed_date}</TableCell>
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
                    ))
                )}
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
                  name="patient"
                  value={formData.patient}
                  onChange={handleFormChange}
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Medication</InputLabel>
                <Select
                  label="Medication"
                  name="drug"
                  value={formData.drug}
                  onChange={handleFormChange}
                >
                  {drugs.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Refills"
                name="refills"
                type="number"
                value={formData.refills}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prescribed Date"
                name="prescribed_date"
                type="date"
                value={formData.prescribed_date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleFormChange}
                multiline
                rows={3}
                placeholder="Special instructions for the patient..."
              />
            </Grid>
            {allergyWarning && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                  {allergyWarning}
                </Alert>
              </Grid>
            )}
            {formError && (
              <Grid item xs={12}>
                <Typography color="error">{formError}</Typography>
              </Grid>
            )}
            {formData.patient && (() => {
              const patient = patients.find((p) => p.id === Number(formData.patient));
              if (patient && patient.detailed_allergies && patient.detailed_allergies.length > 0) {
                return (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Patient Allergies</Typography>
                    {patient.detailed_allergies.map((a) => (
                      <Alert key={a.id} severity="warning" sx={{ mb: 1 }}>
                        <strong>{a.allergy?.name || 'Unknown'}</strong>
                        {a.reaction ? ` — ${a.reaction}` : ''}
                        {a.date_noted ? ` (Noted: ${a.date_noted})` : ''}
                      </Alert>
                    ))}
                  </Box>
                );
              }
              return null;
            })()}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={formLoading}>
            {selectedPrescription ? 'Update' : 'Create'} Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prescriptions; 