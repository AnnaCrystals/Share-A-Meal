//process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal-testdb';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
const dbconnection = require('../../src/util/mysql-db');
const jwt = require('jsonwebtoken');
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

describe('TC-20x user', () => {
  describe('TC-201 Registreren als nieuwe user', () => {
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .set('Authorization', `Bearer` + jwt.sign({userId : 1}, jwtSecretKey))
        .send({
          firstName: "Daan",
          lastName: "de Vries",
          street: "Frost",
          city: "Snowland",
          isActive: 1,
          //Email bewust weggelaten
          //emailAddress: "d.devries11@avans.nl",
          password: "vriesvries",
          phoneNumber: "06151544554",
        })
        .end((err, res) => {
          console.log('Response body 201-1:', res.body);
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
        .send({
          firstName: 'Marieke',
          lastName: 'Van Dam',
          street: '',
          city: '',
          isActive: 0,
          emailAddress: 'm.vandam@server.nl',
          password: 'secret',
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

    let registeredUserId; // Variable to store the registered user ID
    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: "Astolfo",
          lastName: "Rider",
          street: "road",
          city: "Yggdmillennia",
          isActive: 1,
          emailAddress: "a.rider@avans.nl",
          password: "callme",
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
          password.should.be.a('string').to.be.equal("callme");
          phoneNumber.should.be.a('string').to.be.equal("1242146");

          // Store the registered user ID
          registeredUserId = res.body.data.id;
          done();
        });
    });


    it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .set('Authorization', `Bearer` + jwt.sign({userId : 1}, jwtSecretKey))
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


    it.skip('TC-203-2 Gebruiker is ingelogd met geldig token.', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set('Authorization', `Bearer` + jwt.sign({userId : 1}, jwtSecretKey))
        .end((err, res) => {
          console.log('Response body 203-2:', res.body);
          res.body.should.be.an('object')
          res.body.should.has.property('status').to.be.equal(200);
          res.body.should.has.property('message');
          res.body.should.has.property('data').to.not.be.empty;
          let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data;
          firstName.should.be.a('string').to.be.equal("Mariëtte");
          lastName.should.be.a('string').to.be.equal("van den Dullemen");
          street.should.be.a('string').to.be.equal("");
          city.should.be.a('string').to.be.equal("");
          //isActive.should.be.a('integer').to.be.equal(1);
          emailAddress.should.be.a('string').to.be.equal("m.vandullemen@server.nl");
          password.should.be.a('string').to.be.equal("secret");
          phoneNumber.should.be.a('string').to.be.equal("");
          done();
        });
    });

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
      chai.request(server)
        .get('/api/user/9999999')
        .set('Authorization', `Bearer` + jwt.sign({userId : 1}, jwtSecretKey))
        .end((err, res) => {
          console.log('Response body 204-2:', res.body);
          res.body.should.have.status(404)
          res.body.should.has.property('status').to.be.equal(404);
          res.body.should.has.property('data').to.be.empty;
          res.body.should.has.property('message').that.equals('User met ID 9999999 niet gevonden')
          done();
        });
    });

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
      chai
        .request(server)
        .get('/api/user/2')
        .set('Authorization', `Bearer` + jwt.sign({userId : 1}, jwtSecretKey))
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
          password: "vriesvries",
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

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
      chai.request(server)
        .delete('/api/user/99999999999')
        .set('Authorization', `Bearer` + jwt.sign({userId : 99999999999}, jwtSecretKey))
        .end((err, res) => {
          console.log('Response body 205-4:', res.body);
          res.body.should.has.property('status').to.be.equal(404);
          res.body.should.has.property('data').to.be.empty;
          done();
        });
    });

    it('TC-205-6 Gebruiker succesvol gewijzigd', function (done) {
      const updatedUser = {
        //Updating user with already existing user
        firstName: "Marieke",
        lastName: "Van Dam",
        isActive: 1,
        emailAddress: "m.vandam@server.nl",
        password: "secret",
        phoneNumber: "06-12345678",
        roles: "editor,guest",
        street: "",
        city: ""
      };

      chai
        .request(server)
        .put('/api/user/4')
        .set('Authorization', `Bearer` + jwt.sign({userId : 4}, jwtSecretKey))
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

    it('TC-206-1 Gebruiker bestaat niet', (done) => {
      chai.request(server)
        .delete('/api/user/99999999999999')
        .set('Authorization', `Bearer` + jwt.sign({userId : 99999999999}, jwtSecretKey))
        .end((err, res) => {
          console.log('Response body 206-1:', res.body);
          res.body.should.has.property('status').to.be.equal(404);
          res.body.should.has.property('data').to.be.empty;
          res.body.should.has.property('message').that.equals('User met ID 99999999999999 niet gevonden')
          done();
        });
    });

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
      chai
        .request(server)
        .delete(`/api/user/${registeredUserId}`)
        .set('Authorization', `Bearer` + jwt.sign({userId : registeredUserId}, jwtSecretKey))
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
});