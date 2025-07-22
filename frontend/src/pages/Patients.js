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
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { patientsAPI, allergiesAPI, drugsAPI } from '../services/api';
import PrescriptionDialog from '../components/PrescriptionDialog';
import { prescriptionsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    medical_history: '',
    detailed_allergies: [],
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [prescriptionDialogPatient, setPrescriptionDialogPatient] = useState(null);
  const [prescriptionDialogError, setPrescriptionDialogError] = useState('');
  const [prescriptionDialogLoading, setPrescriptionDialogLoading] = useState(false);
  const [prescriptionDialogBackendWarning, setPrescriptionDialogBackendWarning] = useState('');
  const [drugs, setDrugs] = useState([]);
  const [showNewAllergyForm, setShowNewAllergyForm] = useState(false);
  const [newAllergyName, setNewAllergyName] = useState('');
  const [newAllergyDescription, setNewAllergyDescription] = useState('');
  const [newAllergyLoading, setNewAllergyLoading] = useState(false);
  const [newAllergyError, setNewAllergyError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchAllergies();
    fetchDrugs();
    // Optionally, clear patients state on unmount
    return () => setPatients([]);
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await patientsAPI.getAll();
      setPatients(res.data);
    } catch (err) {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllergies = async () => {
    try {
      const res = await allergiesAPI.getAll();
      setAllergies(res.data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const fetchDrugs = async () => {
    try {
      const res = await drugsAPI.getAll();
      setDrugs(res.data);
    } catch (err) {
      setDrugs([]);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone || '').includes(searchTerm)
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (patient = null) => {
    setSelectedPatient(patient);
    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        medical_history: patient.medical_history || '',
        detailed_allergies: (patient.detailed_allergies || []).map(a => ({
          allergy_id: a.allergy?.id,
          reaction: a.reaction || '',
          date_noted: a.date_noted || '',
          severity: a.severity || '',
        })),
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        medical_history: '',
        detailed_allergies: [],
      });
    }
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormError('');
  };

  const handleAllergyChange = (event) => {
    setFormData({ ...formData, allergies: event.target.value });
  };

  // Allergy management handlers
  const handleAddAllergy = () => {
    setFormData({
      ...formData,
      detailed_allergies: [
        ...formData.detailed_allergies,
        { allergy_id: '', reaction: '', date_noted: '', severity: '' },
      ],
    });
  };
  const handleAllergyFieldChange = (idx, field, value) => {
    const updated = formData.detailed_allergies.map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    );
    setFormData({ ...formData, detailed_allergies: updated });
  };
  const handleRemoveAllergy = (idx) => {
    setFormData({
      ...formData,
      detailed_allergies: formData.detailed_allergies.filter((_, i) => i !== idx),
    });
  };

  // Handler to add new allergy
  const handleCreateNewAllergy = async () => {
    if (!newAllergyName.trim()) {
      setNewAllergyError('Allergy name is required');
      return;
    }
    setNewAllergyLoading(true);
    setNewAllergyError('');
    try {
      const res = await allergiesAPI.create({ name: newAllergyName, description: newAllergyDescription });
      setAllergies([...allergies, res.data]);
      setShowNewAllergyForm(false);
      setNewAllergyName('');
      setNewAllergyDescription('');
      // Optionally auto-select the new allergy in the last allergy row
      setFormData((prev) => {
        const updated = [...prev.detailed_allergies];
        if (updated.length > 0) {
          updated[updated.length - 1].allergy_id = res.data.id;
        }
        return { ...prev, detailed_allergies: updated };
      });
    } catch (err) {
      setNewAllergyError('Failed to create allergy.');
    } finally {
      setNewAllergyLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      // Always send the full detailed_allergies array
      const submitData = { ...formData, detailed_allergies: formData.detailed_allergies };
      if (selectedPatient) {
        await patientsAPI.update(selectedPatient.id, submitData);
      } else {
        await patientsAPI.create(submitData);
      }
      fetchPatients();
      handleCloseDialog();
    } catch (err) {
      setFormError('Failed to save patient.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await patientsAPI.delete(id);
      fetchPatients();
    } catch (err) {
      alert('Failed to delete patient.');
    }
  };

  const handleOpenPrescriptionDialog = (patient) => {
    setPrescriptionDialogPatient(patient);
    setPrescriptionDialogOpen(true);
    setPrescriptionDialogError('');
    setPrescriptionDialogBackendWarning('');
  };
  const handleClosePrescriptionDialog = () => {
    setPrescriptionDialogOpen(false);
    setPrescriptionDialogPatient(null);
    setPrescriptionDialogError('');
    setPrescriptionDialogBackendWarning('');
  };
  const handleCreatePrescription = async (data) => {
    setPrescriptionDialogLoading(true);
    setPrescriptionDialogError('');
    setPrescriptionDialogBackendWarning('');
    try {
      const response = await prescriptionsAPI.create(data);
      if (response && response.data && response.data.allergy_warning) {
        setPrescriptionDialogBackendWarning(response.data.allergy_warning);
      } else {
        handleClosePrescriptionDialog();
      }
    } catch (err) {
      setPrescriptionDialogError('Failed to create prescription.');
    } finally {
      setPrescriptionDialogLoading(false);
    }
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status === 'Active' ? 'Active' : 'Inactive'}
        color={status === 'Active' ? 'success' : 'default'}
        size="small"
      />
    );
  };

  // Allergy severity options
  const allergySeverityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Patient
        </Button>
      </Box>

      <Paper elevation={2}>
        <Box p={3}>
          <Grid container spacing={2} alignItems="center" mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search patients by name, email, or phone..."
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
                  {filteredPatients.length} patients found
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Patient Cards Grid */}
          <Grid container spacing={2}>
            {filteredPatients.length === 0 && !loading && !error && (
              <Grid item xs={12}>
                <Typography align="center">No patients found.</Typography>
              </Grid>
            )}
            {filteredPatients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={patient.id}>
                <Card elevation={3} sx={{ height: '100%', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }} onClick={() => navigate(`/patients/${patient.id}`)}>
                  <CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6">{patient.first_name} {patient.last_name}</Typography>
                    <Typography variant="body2">Age: {patient.age} | Gender: {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</Typography>
                    <Typography variant="body2">{patient.phone || patient.email}</Typography>
                    <Box sx={{ mt: 1, mb: 1 }}>
                      {(patient.detailed_allergies || []).slice(0, 2).map(a => (
                        <Chip key={a.id} label={a.allergy?.name} size="small" sx={{ mr: 0.5 }} color="warning" />
                      ))}
                      {(patient.detailed_allergies || []).length > 2 && (
                        <Chip label={`+${patient.detailed_allergies.length - 2} more`} size="small" />
                      )}
                    </Box>
                    <Box display="flex" gap={1} sx={{ pt: 1 }}>
                      <IconButton color="primary" onClick={e => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={e => { e.stopPropagation(); handleOpenDialog(patient); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={e => { e.stopPropagation(); handleOpenPrescriptionDialog(patient); }}>
                        <AddIcon />
                      </IconButton>
                      <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(patient.id); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPatients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      {/* Patient Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical History"
                name="medical_history"
                multiline
                rows={3}
                value={formData.medical_history}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>Allergies</Typography>
              <Divider sx={{ mb: 2 }} />
              {formData.detailed_allergies.length === 0 && (
                <Typography variant="body2" color="text.secondary">No allergies added.</Typography>
              )}
              {formData.detailed_allergies.map((a, idx) => (
                <Paper key={idx} elevation={2} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Allergy</InputLabel>
                        <Select
                          value={a.allergy_id || ''}
                          onChange={e => handleAllergyFieldChange(idx, 'allergy_id', e.target.value)}
                          renderValue={selected => {
                            const found = allergies.find(al => al.id === selected);
                            return found ? found.name : '';
                          }}
                        >
                          {allergies.map((allergy) => (
                            <MenuItem key={allergy.id} value={allergy.id}>{allergy.name}</MenuItem>
                          ))}
                          <MenuItem value="__add_new__" onClick={() => setShowNewAllergyForm(true)}>
                            + Add New Allergy
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Reaction/Notes"
                        value={a.reaction || ''}
                        onChange={e => handleAllergyFieldChange(idx, 'reaction', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Date Noted"
                        type="date"
                        value={a.date_noted || ''}
                        onChange={e => handleAllergyFieldChange(idx, 'date_noted', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth>
                        <InputLabel>Severity</InputLabel>
                        <Select
                          value={a.severity || ''}
                          onChange={e => handleAllergyFieldChange(idx, 'severity', e.target.value)}
                          label="Severity"
                        >
                          {allergySeverityOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1} sx={{ textAlign: 'right' }}>
                      <IconButton color="error" onClick={() => handleRemoveAllergy(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                variant="outlined"
                size="medium"
                onClick={handleAddAllergy}
                sx={{ mt: 1, display: 'block', mx: 'auto' }}
                startIcon={<AddIcon />}
              >
                Add Allergy
              </Button>
            </Grid>
            {formError && (
              <Grid item xs={12}>
                <Typography color="error">{formError}</Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={formLoading}>
            {selectedPatient ? 'Update' : 'Add'} Patient
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Dialog */}
      <PrescriptionDialog
        open={prescriptionDialogOpen}
        onClose={handleClosePrescriptionDialog}
        onSubmit={handleCreatePrescription}
        patients={patients}
        drugs={drugs}
        initialPatient={prescriptionDialogPatient ? prescriptionDialogPatient.id : ''}
        loading={prescriptionDialogLoading}
        error={prescriptionDialogError}
        backendWarning={prescriptionDialogBackendWarning}
      />

      {showNewAllergyForm && (
        <Box sx={{ mt: 1, mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Typography variant="subtitle2">Add New Allergy</Typography>
          <TextField
            fullWidth
            label="Allergy Name"
            value={newAllergyName}
            onChange={e => setNewAllergyName(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={newAllergyDescription}
            onChange={e => setNewAllergyDescription(e.target.value)}
            sx={{ mb: 1 }}
          />
          {newAllergyError && <Typography color="error">{newAllergyError}</Typography>}
          <Box display="flex" gap={1}>
            <Button variant="contained" size="small" onClick={handleCreateNewAllergy} disabled={newAllergyLoading}>
              Add
            </Button>
            <Button size="small" onClick={() => setShowNewAllergyForm(false)} disabled={newAllergyLoading}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Patients; 