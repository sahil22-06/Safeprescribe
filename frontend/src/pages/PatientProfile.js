import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsAPI, prescriptionsAPI, allergiesAPI } from '../services/api';
import { Box, Typography, Paper, Chip, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Divider } from '@mui/material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allergyDialogOpen, setAllergyDialogOpen] = useState(false);
  const [allergies, setAllergies] = useState([]);
  const [detailedAllergies, setDetailedAllergies] = useState([]);
  const [allergyLoading, setAllergyLoading] = useState(false);
  const [allergyError, setAllergyError] = useState('');
  const [showNewAllergyForm, setShowNewAllergyForm] = useState(false);
  const [newAllergyName, setNewAllergyName] = useState('');
  const [newAllergyDescription, setNewAllergyDescription] = useState('');
  const [newAllergyLoading, setNewAllergyLoading] = useState(false);
  const [newAllergyError, setNewAllergyError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const patientRes = await patientsAPI.getById(id);
        setPatient(patientRes.data);
        const presRes = await prescriptionsAPI.getAll({ patient: id });
        setPrescriptions(presRes.data);
      } catch (err) {
        setError('Failed to load patient profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (allergyDialogOpen) {
      fetchAllergies();
      setDetailedAllergies(patient?.detailed_allergies ? [...patient.detailed_allergies] : []);
    }
  }, [allergyDialogOpen, patient]);

  const fetchAllergies = async () => {
    try {
      const res = await allergiesAPI.getAll();
      setAllergies(res.data);
    } catch (err) {
      setAllergies([]);
    }
  };

  const handleAddAllergy = () => {
    setDetailedAllergies([
      ...detailedAllergies,
      { allergy_id: '', reaction: '', date_noted: '', severity: '' },
    ]);
  };
  const handleAllergyFieldChange = (idx, field, value) => {
    const updated = detailedAllergies.map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    );
    setDetailedAllergies(updated);
  };
  const handleRemoveAllergy = (idx) => {
    setDetailedAllergies(detailedAllergies.filter((_, i) => i !== idx));
  };
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
      setDetailedAllergies((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].allergy_id = res.data.id;
        }
        return updated;
      });
    } catch (err) {
      setNewAllergyError('Failed to create allergy.');
    } finally {
      setNewAllergyLoading(false);
    }
  };
  const handleSaveAllergies = async () => {
    setAllergyLoading(true);
    setAllergyError('');
    try {
      await patientsAPI.update(patient.id, { detailed_allergies: detailedAllergies });
      setAllergyDialogOpen(false);
      // Refresh patient data
      const patientRes = await patientsAPI.getById(id);
      setPatient(patientRes.data);
    } catch (err) {
      setAllergyError('Failed to save allergies.');
    } finally {
      setAllergyLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!patient && !loading) return <Typography align="center" color="text.secondary">Patient not found.</Typography>;

  const allergySeverityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
  ];

  return (
    <Box>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Grid container spacing={3}>
        {/* Left Column: Info, Allergies, History */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>Patient Profile</Typography>
            <Typography variant="h6">{patient.full_name}</Typography>
            <Typography>Age: {patient.age}</Typography>
            <Typography>Gender: {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</Typography>
            <Typography>Phone: {patient.phone}</Typography>
            <Typography>Email: {patient.email}</Typography>
            <Typography>Address: {patient.address}</Typography>
            <Typography>Emergency Contact: {patient.emergency_contact}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Medical History</Typography>
            <Typography sx={{ whiteSpace: 'pre-line' }}>{patient.medical_history || 'None'}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Allergies
              <Button size="small" variant="outlined" sx={{ ml: 2 }} onClick={() => setAllergyDialogOpen(true)} startIcon={<AddIcon />}>
                Edit Allergies
              </Button>
            </Typography>
            {patient.detailed_allergies && patient.detailed_allergies.length > 0 ? (
              <Box>
                {patient.detailed_allergies.map((a) => (
                  <Paper key={a.id} sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label={a.allergy?.name || 'Unknown'} color="warning" />
                    <Typography variant="body2">{a.reaction || 'No reaction specified'}</Typography>
                    <Typography variant="body2" color="text.secondary">{a.date_noted || ''}</Typography>
                    <Chip label={a.severity ? a.severity.charAt(0).toUpperCase() + a.severity.slice(1) : 'N/A'} size="small" color={a.severity === 'severe' ? 'error' : a.severity === 'moderate' ? 'warning' : 'default'} />
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No allergies recorded.</Typography>
            )}
          </Paper>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Prescription History</Typography>
            {prescriptions.length === 0 ? (
              <Typography>No prescriptions found for this patient.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Drug(s)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Prescriber</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescriptions.map((presc) => (
                      <TableRow key={presc.id}>
                        <TableCell>{presc.prescribed_date}</TableCell>
                        <TableCell>
                          {(presc.medications || []).map(med => med.drug_details?.name || '').join(', ')}
                        </TableCell>
                        <TableCell>{presc.status}</TableCell>
                        <TableCell>{presc.prescriber_details ? presc.prescriber_details.username : ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        {/* Right Column: Add Prescription, Add Allergy */}
        <Grid item xs={12} md={5}>
          {/* Placeholder for Add Prescription and Add Allergy forms */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Add Prescription</Typography>
            <Typography color="text.secondary">(Feature coming soon: add prescription form here.)</Typography>
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Add Allergy</Typography>
            <Typography color="text.secondary">(Feature coming soon: add allergy form here.)</Typography>
          </Paper>
        </Grid>
      </Grid>
      {/* Allergy Management Dialog */}
      <Dialog open={allergyDialogOpen} onClose={() => setAllergyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Allergies</DialogTitle>
        <DialogContent>
          {detailedAllergies.length === 0 && (
            <Typography variant="body2" color="text.secondary">No allergies added.</Typography>
          )}
          {detailedAllergies.map((a, idx) => (
            <Grid container spacing={1} key={idx} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Allergy</InputLabel>
                  <Select
                    value={a.allergy_id || a.allergy?.id || ''}
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
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Reaction/Notes"
                  value={a.reaction || ''}
                  onChange={e => handleAllergyFieldChange(idx, 'reaction', e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  label="Date Noted"
                  type="date"
                  value={a.date_noted || ''}
                  onChange={e => handleAllergyFieldChange(idx, 'date_noted', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2}>
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
              <Grid item xs={1} sx={{ textAlign: 'right' }}>
                <IconButton color="error" onClick={() => handleRemoveAllergy(idx)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button variant="outlined" size="small" onClick={handleAddAllergy} sx={{ mt: 1 }} startIcon={<AddIcon />}>Add Allergy</Button>
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
          {allergyError && <Typography color="error">{allergyError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllergyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAllergies} disabled={allergyLoading}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientProfile; 