function errorHandler(err, req, res, next) {
  console.error('[Global Error Handler]:', err);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit. Please upload a smaller image.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

module.exports = errorHandler;
