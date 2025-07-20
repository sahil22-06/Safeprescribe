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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const Medications = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);

  // Mock data - in a real app, this would come from an API
  const medications = [
    {
      id: 1,
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      strength: '10mg',
      form: 'Tablet',
      category: 'ACE Inhibitor',
      manufacturer: 'Generic',
      interactions: ['NSAIDs', 'Lithium', 'Potassium supplements'],
      sideEffects: ['Dry cough', 'Dizziness', 'Fatigue'],
      contraindications: ['Pregnancy', 'Angioedema history'],
      dosage: '10mg once daily',
      availability: 'Available',
    },
    {
      id: 2,
      name: 'Metformin',
      genericName: 'Metformin',
      strength: '500mg',
      form: 'Tablet',
      category: 'Biguanide',
      manufacturer: 'Generic',
      interactions: ['Alcohol', 'Warfarin', 'Furosemide'],
      sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
      contraindications: ['Kidney disease', 'Metabolic acidosis'],
      dosage: '500mg twice daily with meals',
      availability: 'Available',
    },
    {
      id: 3,
      name: 'Warfarin',
      genericName: 'Warfarin',
      strength: '5mg',
      form: 'Tablet',
      category: 'Anticoagulant',
      manufacturer: 'Generic',
      interactions: ['Aspirin', 'NSAIDs', 'Vitamin K', 'Metformin'],
      sideEffects: ['Bleeding', 'Bruising', 'Nausea'],
      contraindications: ['Pregnancy', 'Active bleeding'],
      dosage: '5mg once daily',
      availability: 'Available',
    },
    {
      id: 4,
      name: 'Atorvastatin',
      genericName: 'Atorvastatin',
      strength: '20mg',
      form: 'Tablet',
      category: 'Statin',
      manufacturer: 'Generic',
      interactions: ['Grapefruit juice', 'Cyclosporine', 'Gemfibrozil'],
      sideEffects: ['Muscle pain', 'Liver problems', 'Headache'],
      contraindications: ['Liver disease', 'Pregnancy'],
      dosage: '20mg once daily at bedtime',
      availability: 'Available',
    },
    {
      id: 5,
      name: 'Amlodipine',
      genericName: 'Amlodipine',
      strength: '5mg',
      form: 'Tablet',
      category: 'Calcium Channel Blocker',
      manufacturer: 'Generic',
      interactions: ['Simvastatin', 'Digoxin', 'Warfarin'],
      sideEffects: ['Swelling', 'Dizziness', 'Flushing'],
      contraindications: ['Severe aortic stenosis', 'Cardiogenic shock'],
      dosage: '5mg once daily',
      availability: 'Available',
    },
  ];

  const filteredMedications = medications.filter(medication =>
    medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (medication = null) => {
    setSelectedMedication(medication);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedication(null);
  };

  const getAvailabilityChip = (availability) => {
    return (
      <Chip
        label={availability}
        color={availability === 'Available' ? 'success' : 'error'}
        size="small"
      />
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Medications</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Medication
        </Button>
      </Box>

      <Paper elevation={2}>
        <Box p={3}>
          <Grid container spacing={2} alignItems="center" mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search medications by name, generic name, or category..."
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
                  {filteredMedications.length} medications found
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medication</TableCell>
                  <TableCell>Generic Name</TableCell>
                  <TableCell>Strength & Form</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Interactions</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((medication) => (
                    <TableRow key={medication.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {medication.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{medication.genericName}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {medication.strength}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {medication.form}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={medication.category}
                          size="small"
                          icon={<CategoryIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        {medication.interactions.length > 0 ? (
                          <Chip
                            label={`${medication.interactions.length} interactions`}
                            color="warning"
                            size="small"
                            icon={<WarningIcon />}
                          />
                        ) : (
                          <Chip label="None" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell>{getAvailabilityChip(medication.availability)}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(medication)}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(medication)}
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
            count={filteredMedications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      {/* Medication Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMedication ? 'Medication Details' : 'Add New Medication'}
        </DialogTitle>
        <DialogContent>
          {selectedMedication ? (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Medication Name"
                    defaultValue={selectedMedication.name}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Generic Name"
                    defaultValue={selectedMedication.genericName}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Strength"
                    defaultValue={selectedMedication.strength}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Form"
                    defaultValue={selectedMedication.form}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    defaultValue={selectedMedication.category}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Manufacturer"
                    defaultValue={selectedMedication.manufacturer}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dosage"
                    defaultValue={selectedMedication.dosage}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>

              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" color="warning.main">
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Drug Interactions ({selectedMedication.interactions.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedMedication.interactions.map((interaction, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={interaction} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" color="error.main">
                    <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Side Effects ({selectedMedication.sideEffects.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedMedication.sideEffects.map((effect, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={effect} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" color="error.main">
                    <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contraindications ({selectedMedication.contraindications.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedMedication.contraindications.map((contraindication, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={contraindication} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medication Name"
                  placeholder="Enter medication name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Generic Name"
                  placeholder="Enter generic name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Strength"
                  placeholder="e.g., 10mg"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Form"
                  placeholder="e.g., Tablet, Capsule"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  placeholder="e.g., ACE Inhibitor"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  placeholder="Enter manufacturer"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dosage Instructions"
                  multiline
                  rows={3}
                  placeholder="Enter dosage instructions..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {!selectedMedication && (
            <Button variant="contained" onClick={handleCloseDialog}>
              Add Medication
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Medications; 