export const globalErrorHandler = (err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ success: false, msg: 'File upload error: ' + err.message });
  }
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    msg: process.env.NODE_ENV === 'production' ? "Internal Server Error" : err.message
  });
};
