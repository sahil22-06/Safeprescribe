import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button, Alert, Paper, Divider, Typography, Box
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

function toISODate(dateStr) {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('-');
    return `${y}-${m}-${d}`;
  }
  return dateStr;
}

const PrescriptionDialog = ({
  open,
  onClose,
  onSubmit,
  patients,
  drugs,
  initialPatient = '',
  initialData = {},
  loading = false,
  error = '',
  backendWarning = '',
}) => {
  const [formData, setFormData] = useState({
    patient: initialPatient || '',
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
    ...initialData,
  });
  const [medications, setMedications] = useState([]);
  const [medForm, setMedForm] = useState({ drug: '', dosage: '', frequency: '', duration: '', quantity: '', refills: '' });
  const [medAllergyWarnings, setMedAllergyWarnings] = useState([]);
  // Allergy warning for the medication form
  const [medFormAllergyWarning, setMedFormAllergyWarning] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        patient: initialPatient || '',
        prescribed_date: '',
        expiry_date: '',
        status: 'active',
        instructions: '',
        ...initialData,
      });
      setMedications([]);
      setMedForm({ drug: '', dosage: '', frequency: '', duration: '', quantity: '', refills: '' });
    }
    // eslint-disable-next-line
  }, [open]);

  useEffect(() => {
    if (!formData.patient) {
      setMedAllergyWarnings([]);
      return;
    }
    const patient = patients.find((p) => p.id === Number(formData.patient));
    if (!patient) {
      setMedAllergyWarnings([]);
      return;
    }
    const patientAllergyIds = (patient.detailed_allergies || []).map(a => a.allergy?.id);
    const warnings = medications.map((med) => {
      const drug = drugs.find((d) => d.id === Number(med.drug));
      if (drug && drug.allergy_conflicts) {
        const drugConflictIds = drug.allergy_conflicts.map(a => a.id);
        const conflicts = patientAllergyIds.filter(id => drugConflictIds.includes(id));
        if (conflicts.length > 0) {
          const conflictNames = drug.allergy_conflicts.filter(a => conflicts.includes(a.id)).map(a => a.name);
          return `Warning: Patient is allergic to: ${conflictNames.join(', ')}. This drug may cause an allergic reaction.`;
        }
      }
      return '';
    });
    setMedAllergyWarnings(warnings);
  }, [formData.patient, medications, patients, drugs]);

  useEffect(() => {
    if (!formData.patient || !medForm.drug) {
      setMedFormAllergyWarning('');
      return;
    }
    const patient = patients.find((p) => p.id === Number(formData.patient));
    const drug = drugs.find((d) => d.id === Number(medForm.drug));
    console.log('DEBUG: patient', patient);
    console.log('DEBUG: drug', drug);
    if (patient && drug && drug.allergy_conflicts) {
      const patientAllergyIds = (patient.detailed_allergies || []).map(a => a.allergy?.id);
      const drugConflictIds = drug.allergy_conflicts.map(a => a.id);
      console.log('DEBUG: patientAllergyIds', patientAllergyIds);
      console.log('DEBUG: drugConflictIds', drugConflictIds);
      const conflicts = patientAllergyIds.filter(id => drugConflictIds.includes(id));
      if (conflicts.length > 0) {
        const conflictNames = drug.allergy_conflicts.filter(a => conflicts.includes(a.id)).map(a => a.name);
        setMedFormAllergyWarning(`Warning: Patient is allergic to: ${conflictNames.join(', ')}. This drug may cause an allergic reaction.`);
        return;
      }
    }
    setMedFormAllergyWarning('');
  }, [formData.patient, medForm, patients, drugs]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMedicationChange = (idx, field, value) => {
    const updated = medications.map((med, i) =>
      i === idx ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };
  const handleAddMedication = () => {
    // Validate medication form
    const requiredFields = ['drug', 'dosage', 'frequency', 'duration', 'quantity', 'refills'];
    for (const field of requiredFields) {
      if (!medForm[field]) {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return;
      }
    }
    setMedications([...medications, medForm]);
    setMedForm({ drug: '', dosage: '', frequency: '', duration: '', quantity: '', refills: '' });
  };
  const handleRemoveMedication = (idx) => {
    setMedications(medications.filter((_, i) => i !== idx));
  };

  const handleMedFormChange = (e) => {
    setMedForm({ ...medForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.patient) {
      alert('Please select a patient.');
      return;
    }
    if (!formData.prescribed_date) {
      alert('Please select a prescribed date.');
      return;
    }
    if (medications.length === 0) {
      alert('Please add at least one medication.');
      return;
    }
    onSubmit({
      ...formData,
      prescribed_date: toISODate(formData.prescribed_date),
      expiry_date: toISODate(formData.expiry_date),
      patient: Number(formData.patient),
      medications,
      status: formData.status.toLowerCase(),
    });
  };

  // Only show the 'Add Medication' button if the last medication row is filled out
  const lastMed = medications[medications.length - 1];
  const canAddMedication = lastMed && ['drug', 'dosage', 'frequency', 'duration', 'quantity', 'refills'].every(f => lastMed[f]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData && initialData.id ? 'Edit Prescription' : 'New Prescription'}</DialogTitle>
      <DialogContent>
        {/* Section 1: Prescription Info */}
        <Typography variant="h6" sx={{ mb: 2 }}>Prescription Information</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                label="Patient"
                name="patient"
                value={formData.patient}
                onChange={handleFormChange}
                disabled={!!initialPatient}
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
        </Grid>
        <Divider sx={{ my: 2 }} />
        {/* Section 2: Add Medication */}
        <Typography variant="h6" sx={{ mb: 2 }}>Add Medication</Typography>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Medication</InputLabel>
              <Select
                label="Medication"
                name="drug"
                value={medForm.drug}
                onChange={handleMedFormChange}
              >
                {drugs.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth label="Dosage" name="dosage" value={medForm.dosage} onChange={handleMedFormChange} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth label="Frequency" name="frequency" value={medForm.frequency} onChange={handleMedFormChange} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth label="Duration" name="duration" value={medForm.duration} onChange={handleMedFormChange} />
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField fullWidth label="Qty" name="quantity" type="number" value={medForm.quantity} onChange={handleMedFormChange} />
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField fullWidth label="Refills" name="refills" type="number" value={medForm.refills} onChange={handleMedFormChange} />
          </Grid>
          {medFormAllergyWarning && (
            <Grid item xs={12}>
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 1 }}>{medFormAllergyWarning}</Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleAddMedication} sx={{ mt: 1 }}>Add Medication</Button>
          </Grid>
        </Grid>
        {/* Dynamic List of Added Medications */}
        {medications.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Medications List</Typography>
            {medications.map((med, idx) => (
              <Paper key={idx} elevation={1} sx={{ mb: 1, p: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {drugs.find(d => d.id === Number(med.drug))?.name || ''} | {med.dosage} | {med.frequency} | {med.duration} | Qty: {med.quantity} | Refills: {med.refills}
                </Typography>
                <Button color="error" size="small" onClick={() => handleRemoveMedication(idx)}>Remove</Button>
              </Paper>
            ))}
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        {/* Other prescription fields */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
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
              <Select label="Status" name="status" value={formData.status} onChange={handleFormChange}>
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
        </Grid>
        {(backendWarning) && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            {backendWarning}
          </Alert>
        )}
        {error && (
          <Alert severity="error">{error}</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || medications.length === 0}>
          {initialData && initialData.id ? 'Update' : 'Create'} Prescription
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionDialog; 