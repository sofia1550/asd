const errorHandler = (err, req, res, next) => {
    // Log del error para el desarrollador
    console.error(err.stack);
    
    // Mapeo de errores comunes a respuestas HTTP
    const errorResponse = {
      ValidationError: 400,
      UnauthorizedError: 401,
    };
    
    const status = errorResponse[err.name] || 500;
    
    res.status(status).json({
      error: {
        name: err.name,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Incluye el stacktrace solo en desarrollo
      }
    });
  };
  
  module.exports = errorHandler;
  