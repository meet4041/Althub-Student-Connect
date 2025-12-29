import React from 'react';
import "../styles/FilterModal.css"; // <--- Import CSS

// MUI Imports
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, TextField, 
  Select, MenuItem, FormControl, InputLabel, Box, Stack
} from "@mui/material";

import {
  Close, Tune, RestartAlt
} from "@mui/icons-material";

// Generate Years List (1980 - Current+5)
const currentYear = new Date().getFullYear();
const years = Array.from(new Array(50), (val, index) => currentYear + 5 - index);

const FilterModal = ({ 
  closeModal, 
  add, setAdd, 
  skill, setSkill, 
  degree, setDegree, 
  year, setYear, 
  handleFilter 
}) => {
  
  const handleReset = () => {
    setAdd("");
    setSkill("");
    setDegree("");
    setYear("");
  }

  return (
    <Dialog 
      open={true} 
      onClose={closeModal} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        style: { borderRadius: 16 } // Rounder corners for the modal
      }}
    >
      
      {/* Header */}
      <DialogTitle className="filter-modal-title">
        <Typography variant="h6" className="filter-modal-header-text">
          <Tune fontSize="small" sx={{ color: '#66bd9e' }} /> Filter Users
        </Typography>
        <IconButton onClick={closeModal} size="small"><Close /></IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent className="filter-modal-content">
        <Stack spacing={3} className="filter-form-stack">
          
          <TextField
            label="Location / City"
            placeholder="e.g. Mumbai, New York"
            fullWidth
            variant="outlined"
            value={add}
            onChange={(e) => setAdd(e.target.value)}
            className="filter-input"
          />

          <TextField
            label="Skills"
            placeholder="e.g. React, Python"
            fullWidth
            variant="outlined"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="filter-input"
          />

          <TextField
            label="Degree / Course"
            placeholder="e.g. B.Tech, MBA"
            fullWidth
            variant="outlined"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="filter-input"
          />

          <FormControl fullWidth className="filter-input">
            <InputLabel>Passing Year</InputLabel>
            <Select
              value={year}
              label="Passing Year"
              onChange={(e) => setYear(e.target.value)}
            >
              <MenuItem value=""><em>Any Year</em></MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions className="filter-modal-actions">
        <Button 
          onClick={handleReset} 
          startIcon={<RestartAlt />} 
          className="filter-reset-btn"
        >
          Reset
        </Button>
        <Button 
          onClick={handleFilter} 
          variant="contained" 
          className="filter-apply-btn"
        >
          Apply Filters
        </Button>
      </DialogActions>

    </Dialog>
  );
}

export default FilterModal;