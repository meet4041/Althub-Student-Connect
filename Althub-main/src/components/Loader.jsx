import React from "react";
import { Backdrop, CircularProgress, Typography } from "@mui/material";
import "../styles/Loader.css"; // <--- Import CSS

const Loader = () => {
  return (
    <Backdrop className="loader-backdrop" open={true}>
      <CircularProgress size={60} sx={{ color: '#66bd9e' }} thickness={4} />
      <Typography variant="h6" className="loader-text">
        Loading...
      </Typography>
    </Backdrop>
  );
};

export default Loader;