var express = require('express');
var router = express.Router();
const assert = require('assert');


router.use(express.json());

let users = [
  {
    id: 1,
    firstName: "Daan",
    lastName: "de Vries",
    emailAddress: "d.devries11@avans.nl",
  }, {
    id: 2,
    firstName: "Janko",
    lastName: "Seremak",
    emailAddress: "j.seremak@avans.nl",
  }, {
    id: 3,
    firstName: "Bridget",
    lastName: "Brisket",
    emailAddress: "b.brisket@avans.nl",
  },
];

let index = users.length;

//UC-201 Registreren als nieuwe user
router.post('/', (req, res, next) => {
  let newUser = req.body;
  let { firstName, lastName, emailAddress } = req.body;
  try {

    assert(typeof firstName === 'string', 'firstName must be a string')
    assert(typeof lastName === 'string', 'lastName must be a string')
    assert(typeof emailAddress === 'string', 'emailAddress must be a string')

    index = index + 1;
    newUser = {
      id: index,
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress
    };

    users.push(newUser);
    res.status(201).json({
      status: 201,
      message: `User met ID ${index} is toegevoegd`,
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.toString(),
      data: {},
    })
  }
});

//UC-202 Opvragen van overzicht van users
router.get('/', function (req, res, next) {

  res.status(200).json({
    status: 200,
    message: `Users succesvol opgevraagd`,
    data: users,
  })

});

//UC-203 Opvragen van gebruikersprofiel
router.get('/profile', (req, res, next) => {
  res.status(200).json({
    status: 200,
    message: 'Profiel van user succesvol opgevraagd',
    data: {
      id: 1,
      firstName: "Daan",
      lastName: "de Vries",
      emailAddress: "d.devries11@avans.nl",
    }
  });
});

//UC-204 Opvragen van usergegevens bij ID
router.get('/:userId', (req, res, next) => {
  let userId = req.params.userId;
  let user = users.filter((item) => item.id == userId);
  if (user[0]) {
    res.status(200).json({
      status: 200,
      message: `User met ID ${userId} is gevonden`,
      data: user[0],
    });
  } else {
    res.status(400).json({
      status: 400,
      message: `User met ID ${userId} niet gevonden`,
      data: {},
    })
  }
});


//UC-205 Wijzigen van usergegevens
router.put('/:userId', (req, res, next) => {
  const { userId } = req.params;
  const { firstName, lastName, emailAddress } = req.body;
  try {

    assert(typeof firstName === 'undefined' || (typeof firstName === 'string'), 'firstName must be a string');
    assert(typeof lastName === 'undefined' || (typeof lastName === 'string'), 'lastName must be a string');
    assert(typeof emailAddress === 'undefined' || (typeof emailAddress === 'string'), 'emailAddress must be a string');

    //Dit moet je gebruiken om een user te updaten.
    //Eerst vind die de user om te updaten met de userId.
    //Als die User met de Id niet bestaat krijg je een 'not found error'.
    //Als ie wel bestaat wordt de user geupdate met de nieuwe data.

    const userUpdate = users.find(user => user.id === parseInt(userId));
    if (!userUpdate) {
      res.status(404).json({
        status: 404,
        message: `User met ID ${userId} niet gevonden`,
        data: {},
      });
    }
    userUpdate.firstName = firstName || userUpdate.firstName;
    userUpdate.lastName = lastName || userUpdate.lastName;
    userUpdate.emailAddress = emailAddress || userUpdate.emailAddress;

    res.status(200).json({
      status: 200,
      message: `User met ID ${userId} is geupdated`,
      data: userUpdate,
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.toString(),
      data: {},
    });
  }
});

//UC-206 Verwijderen van user
router.delete('/:userId', (req, res, next) => {

  //Dit moet je gebruiken om een user te verwijderen.
  //Eerst vind die de user om te verwijderen met de userId.
  //Als de Id niet bestaat (-1) dan geeft ie een error.
  //Als de Id wel bestaat wordt de user verwijderd.

  const  id  = req.params.userId;
  var userIndex = users.findIndex(user => user.id === parseInt(id));
  
  if (userIndex === -1) {
    res.status(404).json({
      status: 404,
      message: `User met ID ${id} niet gevonden`,
      data: {},
    });
} else {
  users.splice(userIndex, 1);
    res.status(200).json({
      status: 200,
      message: `User met ID ${id} is verwijderd`,
      data: {},
    });
  }
});

module.exports = router;