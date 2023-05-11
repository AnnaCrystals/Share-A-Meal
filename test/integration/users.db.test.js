process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal-testdb';

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
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
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
        .send({
          firstName: "Daan",
          lastName: "de Vries",
          street: "Frost",
          city: "Snowland",
          isActive: 1,
          //Email bewust weggelaten
          //emailAdress: "d.devries11@avans.nl",
          password: "vriesvries",
          phoneNumber: "06151544554",
        })
        .end((err, res) => {
          res.body.should.be.an('object');
          res.body.should.has.property('status').to.be.equal(400);
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
          emailAdress: "a.rider@avans.nl",
          password: "callme",
          phoneNumber: "1242146"
        })
        .end((err, res) => {
          res.body.should.be.an('object')
          res.body.should.have.property('status', 201);
          res.body.should.have.property('message');
          res.body.should.have.property('data').to.not.be.empty;
          let { firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber } = res.body.data;
          firstName.should.be.a('string').to.be.equal("Astolfo");
          lastName.should.be.a('string').to.be.equal("Rider");
          street.should.be.a('string').to.be.equal("road");
          city.should.be.a('string').to.be.equal("Yggdmillennia");
          //isActive.should.be.a('integer').to.be.equal(1);
          emailAdress.should.be.a('string').to.be.equal("a.rider@avans.nl");
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
        .end((err, res) => {
          res.body.should.be.an('object')
          res.body.should.has.property('status', 200);
          res.body.should.has.property('message');
          res.body.should.has.property('data').to.not.be.empty;
          res.body.should.has.property('data').that.is.an('array').with.length.gte(2);
          done();
        });
    });


    it('TC-203-2 Gebruiker is ingelogd met geldig token.', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .end((err, res) => {
          res.body.should.be.an('object')
          res.body.should.has.property('status', 200);
          res.body.should.has.property('message');
          res.body.should.has.property('data').to.not.be.empty;
          let { firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber } = res.body.data;
          firstName.should.be.a('string').to.be.equal("Mariëtte");
          lastName.should.be.a('string').to.be.equal("van den Dullemen");
          street.should.be.a('string').to.be.equal("");
          city.should.be.a('string').to.be.equal("");
          //isActive.should.be.a('integer').to.be.equal(1);
          emailAdress.should.be.a('string').to.be.equal("m.vandullemen@server.nl");
          password.should.be.a('string').to.be.equal("secret");
          phoneNumber.should.be.a('string').to.be.equal("");
          done();
        });
    });

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
      chai
        .request(server)
        .get('/api/user/2')
        .end((err, res) => {
          res.body.should.be.an('object')
          res.body.should.has.property('status', 200);
          res.body.should.has.property('message');
          res.body.should.has.property('data').to.not.be.empty;
          let { firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber } = res.body.data;
          firstName.should.be.a('string').to.be.equal("John");
          lastName.should.be.a('string').to.be.equal("Doe");
          street.should.be.a('string').to.be.equal("");
          city.should.be.a('string').to.be.equal("");
          //isActive.should.be.a('integer').to.be.equal(1);
          emailAdress.should.be.a('string').to.be.equal("j.doe@server.com");
          password.should.be.a('string').to.be.equal("secret");
          phoneNumber.should.be.a('string').to.be.equal("06 12425475");
          done();
        });
    });

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
      chai
        .request(server)
        .delete(`/api/user/${registeredUserId}`)
        .end((err, res) => {
          res.body.should.be.an('object');
          res.body.should.has.property('status', 200);
          res.body.should.has.property('message');
          res.body.should.has.property('data').to.be.empty;
          done();
        });
    });

  });
});