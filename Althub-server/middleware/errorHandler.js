export const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err && err.name === 'MulterError') {
    return res.status(400).json({ success: false, msg: 'File upload error: ' + err.message });
  }

  console.error("Server Error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    msg: process.env.NODE_ENV === 'production' && !err.expose ? "Internal Server Error" : err.message
  });
};
