const assert = require('assert')


const userController = {

    getInfo: function (req, res, next) {
        res.status(200).json({
            status: 200,
            message: 'Server info-endpoint',
            data: {
                studentName: 'Davide',
                studentNumber: 1234567,
                description: 'Welkom bij de server van API van de Share A Meal'
            }
        });
    }
};
module.exports = userController