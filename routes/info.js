var express = require('express');
var router = express.Router();

module.exports = router;

router.use('*', (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} is aangeroepen`);
    next();
  })
  router.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Server info-endpoint',
      data: {
        studentName: 'Daan de Vries',
        studentNumber: 2205132,
        description: 'Welkom bij de server van API van de Share A Meal'
      }
    });
  });

  router.use('*', (req, res) => {
    res.status(404).json({
      status: 200,
      message: 'Server info-endpoint',
      data: {}
    })
  });