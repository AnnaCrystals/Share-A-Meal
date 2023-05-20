const express = require('express');
const logger = require('./src/util/utils').logger;
const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes')
const mealRoutes = require('./src/routes/meal.routes')

const app = express();
const port = process.env.PORT || 3000;

// For access to application/json request body
app.use(express.json());

// Algemene route, vangt alle http-methods en alle URLs af, print
// een message, en ga naar de next URL (indien die matcht)!
app.use('*', (req, res, next) => {
  const method = req.method;
  logger.trace(`Methode ${method} is aangeroepen`);
  next();
});

// Info endpoints
app.get('/api/info', (req, res) => {
  logger.info('Get server information');
  res.status(201).json({
    status: 201,
    message: 'Server info-endpoint',
    data: {
      studentName: 'Davide',
      studentNumber: 1234567,
      description: 'Welkom bij de server API van de share a meal.'
    }
  });
});

// Hier staan de referenties naar de routes
app.use('/api', authRoutes);
app.use('/api/meal', mealRoutes);
app.use('/api/user', userRoutes);

// Wanneer geen enkele endpoint matcht kom je hier terecht. Dit is dus
// een soort 'afvoerputje' (sink) voor niet-bestaande URLs in de server.
app.use('*', (req, res) => {
  logger.warn('Invalid endpoint called: ', req.path);
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {}
  });
});

// Express error handler
// app.use((err, req, res, next) => {
//   logger.error(err.code, err.message);
//   res.status(err.code).json({
//     statusCode: err.code,
//     message: err.message,
//     data: {}
//   });
// });
app.use((err, req, res, next) => {
  // Check if err.code is defined and a valid status code
  const statusCode = err.code && typeof err.code === 'number' ? err.code : 500;

  logger.error(statusCode, err.message);
  res.status(statusCode).json({
    statusCode: statusCode,
    message: err.message,
    data: {}
  });
});


// Start de server
app.listen(port, () => {
  logger.info(`Share-a-Meal server listening on port ${port}`);
});

// Export de server zodat die in de tests beschikbaar is.
module.exports = app;
