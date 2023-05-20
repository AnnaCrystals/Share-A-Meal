//process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal-testdb';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
const dbconnection = require('../../src/util/mysql-db');
const jwt = require('jsonwebtoken');
const authenticationController = require('../../src/controllers/authentication.controller');
const { jwtSecretKey, logger } = require('../../src/util/utils');
require('tracer').setLevel('trace');

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 *
 * LET OP: om via de mysql2 package meerdere queries in één keer uit te kunnen voeren,
 * moet je de optie 'multipleStatements: true' in de database config hebben staan.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAddress`, `password`, `street`, `city` ) VALUES' +
  '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

let token = 0;
let registeredUserId = 0;

describe('TC-201 Registreren als nieuwe user', () => {

  it('TC-201-1 Verplicht veld ontbreekt', (done) => {
    chai
      .request(server)
      .post('/api/user')
      .send({
        firstName: "Daan",
        lastName: "de Vries",
        street: "Frost",
        city: "Snowland",
        //emailAddress: "",
        password: "1Vriesvries",
        phoneNumber: "06151544554",
      })
      .end((err, res) => {
        console.log('Response body 201-1:', res.body);
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });


  //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('TC-201-2 Niet-valide emailadres', (done) => {
    chai.request(server)
      .post('/api/user')
      .send({
        firstName: "Niet",
        lastName: "Valide",
        street: "",
        city: "",
        emailAddress: "invalidemail",
        password: "1Nietvalideemail",
        phoneNumber: "",
      })
      .end((err, res) => {
        console.log('Response body 201-2:', res.body);
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it.skip('TC-201-3 Niet-valide wachtwoord', (done) => {
    chai.request(server)
      .post('/api/user')
      .send({
        firstName: "Niet",
        lastName: "Valide",
        street: "",
        city: "",
        isActive: 1,
        emailAddress: "john.doe@example.com",
        password: "nietvalide",
        phoneNumber: "",
      })
      .end((err, res) => {
        console.log('Response body 201-3:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(400);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-201-4 Gebruiker bestaat al', (done) => {
    chai
      .request(server)
      .post('/api/user')
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: 'Marieke',
        lastName: 'Van Dam',
        street: '',
        city: '',
        isActive: 0,
        emailAddress: 'm.vandam@avans.nl',
        password: '1Vandammarieke',
        phoneNumber: '06-12345678'
      })
      .end((err, res) => {
        console.log('Response body 201-4:', res.body);
        res.body.should.has.property('status').to.be.equal(403);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
    chai
      .request(server)
      .post('/api/user')
      //.set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Astolfo",
        lastName: "Rider",
        street: "road",
        city: "Yggdmillennia",
        isActive: 1,
        emailAddress: "a.rider@avans.nl",
        password: "Astolforider12",
        phoneNumber: "1242146"
      })
      .end((err, res) => {
        console.log('Response body 201-5:', res.body);
        res.body.should.be.an('object')
        res.body.should.has.property('status').to.be.equal(201);
        res.body.should.have.property('message');
        res.body.should.have.property('data').to.not.be.empty;
        let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data;
        firstName.should.be.a('string').to.be.equal("Astolfo");
        lastName.should.be.a('string').to.be.equal("Rider");
        street.should.be.a('string').to.be.equal("road");
        city.should.be.a('string').to.be.equal("Yggdmillennia");
        //isActive.should.be.a('integer').to.be.equal(1);
        emailAddress.should.be.a('string').to.be.equal("a.rider@avans.nl");
        password.should.be.a('string').to.be.equal("Astolforider12");
        phoneNumber.should.be.a('string').to.be.equal("1242146");

        // Store the registered user ID
        registeredUserId = res.body.data.id;

        done();

      });
  });
  after((done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ emailAddress: "a.rider@avans.nl", password: "Astolforider12" })
      .end((loginErr, loginRes) => {
        token = loginRes.body.data.token;
        logger.info(`Token created: ${token}`);
        done();
      });
  });

});


describe('TC-202 Opvragen van overzicht users', () => {
  it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
    chai
      .request(server)
      .get('/api/user')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 202-1:', res.body);
        res.body.should.be.an('object')
        //Misschien res.body.status weghalen
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.not.be.empty;
        res.body.should.has.property('data').that.is.an('array').with.length.gte(2);
        done();
      });
  });

  it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
    chai.request(server)
      .get('/api/user?fakeFilter=fake')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.body.should.have.property('data');
        res.should.have.status(200);
        done();
      });
  });

  it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', (done) => {
    chai.request(server)
      .get('/api/user?isActive=false')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').that.is.an('array').with.length.gte(2);
        done();
      });
  });

  it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', (done) => {
    chai.request(server)
      .get('/api/user?isActive=true')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').that.is.an('array').with.length.gte(2);
        const filteredUser = res.body.data[0];
        filteredUser.firstName.should.equal('Mariëtte');
        filteredUser.lastName.should.equal('van den Dullemen');
        done();
      });

  });

  it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', (done) => {
    chai.request(server)
      .get('/api/user?password=secret&isActive=true')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').that.is.an('array').with.length.gte(2);
        const filteredUser = res.body.data[0];
        filteredUser.firstName.should.equal('Mariëtte');
        filteredUser.lastName.should.equal('van den Dullemen');
        filteredUser.isActive.should.equal(1);
        filteredUser.password.should.equal('secret');

        const filteredUser2 = res.body.data[1];
        filteredUser2.isActive.should.equal(1);
        filteredUser2.password.should.equal('secret');
        done();
      });

  });
});

//Hier nog een 401 code toevoegen
describe('TC-203 Opvragen van gebruikersprofiel', () => {
  it('TC-203-1 Ongeldig token', (done) => {
    chai
      .request(server)
      .get('/api/user/profile')
      //.set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        done();
      });
  });


  it('TC-203-2 Gebruiker is ingelogd met geldig token.', (done) => {
    chai
      .request(server)
      .get('/api/user/profile')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 203-2:', res.body);
        res.body.should.be.an('object')
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.not.be.empty;
        let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data;
        firstName.should.be.a('string').to.be.equal("Astolfo");
        lastName.should.be.a('string').to.be.equal("Rider");
        street.should.be.a('string').to.be.equal("road");
        city.should.be.a('string').to.be.equal("Yggdmillennia");
        //isActive.should.be.a('integer').to.be.equal(1);
        emailAddress.should.be.a('string').to.be.equal("a.rider@avans.nl");
        password.should.be.a('string').to.be.equal("Astolforider12");
        phoneNumber.should.be.a('string').to.be.equal("1242146");
        done();
      });
  });
});



describe('TC-204 Opvragen van usergegevens bij ID', () => {
  //Hier codes toevoegen
  it('TC-204-1 Ongeldig token', (done) => {
    chai.request(server)
      .get('/api/user/1')
      .set('Authorization', 'Bearer ' + jwt.sign({ userid: 2 }, jwtSecretKey))
      .end((err, res) => {
        done();
      });
  });

  it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
    chai.request(server)
      .get('/api/user/999')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 204-2:', res.body);
        res.body.should.have.status(404)
        res.body.should.has.property('status').to.be.equal(404);
        res.body.should.has.property('data').to.be.empty;
        res.body.should.has.property('message').that.equals('User met ID 999 niet gevonden')
        done();
      });
  });

  it('TC-204-3 Gebruiker-ID bestaat', (done) => {
    chai
      .request(server)
      .get('/api/user/2')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 204-3:', res.body);
        res.body.should.be.an('object')
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.not.be.empty;
        let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data;
        firstName.should.be.a('string').to.be.equal("John");
        lastName.should.be.a('string').to.be.equal("Doe");
        street.should.be.a('string').to.be.equal("");
        city.should.be.a('string').to.be.equal("");
        //isActive.should.be.a('integer').to.be.equal(1);
        emailAddress.should.be.a('string').to.be.equal("j.doe@server.com");
        password.should.be.a('string').to.be.equal("secret");
        phoneNumber.should.be.a('string').to.be.equal("06 12425475");
        done();
      });
  });
});

describe('TC-205 Updaten van usergegevens', () => {
  it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', (done) => {
    chai
      .request(server)
      .post('/api/user')
      .send({
        firstName: "Daan",
        lastName: "de Vries",
        street: "Frost",
        city: "Snowland",
        isActive: 1,
        //Email bewust weggelaten
        //emailAddress: "d.devries11@avans.nl",
        password: "Vriesvries2003",
        phoneNumber: "06151544554",
      })
      .end((err, res) => {
        console.log('Response body 205-1:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(400);
        res.body.should.has.property('message')
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-205-2 De gebruiker is niet de eigenaar van de data', (done) => {
    chai.request(server)
      .put('/api/user/5')
      .set('Authorization', 'Bearer ' + jwt.sign({ userid: 123 }, jwtSecretKey))
      .end((err, res) => {
        res.body.should.have.status(403)
        res.body.should.has.property('message')
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  //Hier een code toevoegen
  it.skip('TC-205-3 Niet-valide telefoonnummer', (done) => {
    chai.request(server)
      .put('/api/user/5')
      .set('Authorization', 'Bearer ' + jwt.sign({ userid: 5 }, jwtSecretKey))
      .send({
        firstName: 'Jacob',
        lastName: 'Edwards',
        isActive: 1,
        emailAdress: 'j.edwards@server.com',
        password: "Password1234",
        phoneNumber: "0519",
        street: "Street",
        city: "Anytown"
      })
      .end((err, res) => {
        done();
      });
  });

  //Niet authorized
  it.skip('TC-205-4 Gebruiker bestaat niet', (done) => {
    const nonExistantId = 9999;
    chai.request(server)
      .put(`/api/user/${nonExistantId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 205-4:', res.body);
        res.body.should.has.property('status').to.be.equal(404);
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-205-5 Niet ingelogd', (done) => {
    chai.request(server)
      .put('/api/user/1')
      .end((err, res) => {
        res.body.should.have.status(401)
        done();
      });
  });

  //Niet authorized hiervoor of iets anders hiermee
  it('TC-205-6 Gebruiker succesvol gewijzigd', function (done) {
    const updatedUser = {
      //Updating user with already existing user
      firstName: "Mariek",
      lastName: "Van D",
      isActive: 1,
      emailAddress: "a.rider@avans.nl",
      password: "Marieke12345",
      phoneNumber: "06-12345678",
      roles: "editor,guest",
      street: "road",
      city: "Yggdmillennia"
    };

    chai
      .request(server)
      .put(`/api/user/${registeredUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedUser)
      .end((err, res) => {
        console.log('Response body 205-6:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.have.property('message');

        const { firstName, lastName, street, city, isActive, emailAddress, phoneNumber } = res.body.data;
        firstName.should.be.a('string').to.be.equal(updatedUser.firstName);
        lastName.should.be.a('string').to.be.equal(updatedUser.lastName);
        street.should.be.a('string').to.be.equal(updatedUser.street);
        city.should.be.a('string').to.be.equal(updatedUser.city);
        isActive.should.be.a('number').to.be.equal(updatedUser.isActive);
        emailAddress.should.be.a('string').to.be.equal(updatedUser.emailAddress);
        phoneNumber.should.be.a('string').to.be.equal(updatedUser.phoneNumber);

        done();
      });
  });
});


describe('TC-206 Verwijderen van user', () => {
  //Niet authorized hiervoor
  it.skip('TC-206-1 Gebruiker bestaat niet', (done) => {
    const nonExistentId = registeredUserId + 1;
    chai.request(server)
      .delete('/api/user/999')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 206-1:', res.body);
        res.should.have.status(404);
        res.body.should.have.property('data').to.be.empty;
        res.body.should.have.property('message').that.equals(`User met ID ${nonExistentId} niet gevonden`);
        done();
      });
  });


  it('TC-206-2 Gebruiker is niet ingelogd', (done) => {
    chai.request(server)
      .delete('/api/user/1')
      .end((err, res) => {
        try {
          res.body.should.have.status(401);
          done();
        } catch (error) {
          done(error); // Pass any caught errors to done()
        }
      });
  });


  it('TC-206-3 De gebruiker is niet de eigenaar van de data', (done) => {
    chai.request(server)
      .delete('/api/user/5')
      .set('Authorization', 'Bearer ' + jwt.sign({ userid: 12 }, jwtSecretKey))
      .end((err, res) => {
        res.body.should.have.status(403)
        res.body.should.has.property('message')
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
    logger.info("Registered user" + registeredUserId)
    logger.info("Token of registered user" + token)
    chai
      .request(server)
      .delete(`/api/user/${registeredUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 206-4:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });
});