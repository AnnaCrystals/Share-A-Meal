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


describe('TC-10x - Login', () => {
  describe('TC-101 - Inloggen', (done) => {
    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({
          password: "secret"
        })
        .end((err, res) => {
          console.log('Response body 101-1:', res.body);
          res.body.should.have.status(400)
          res.body.should.have.property('data').to.be.empty
          done();
        });
    });
    it('TC-101-2 Niet-valide wachtwoord', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({
          emailAdress: "m.vandullemen@server.nl",
          password: "secreawdawdawdt"
        })
        .end((err, res) => {
          console.log('Response body 101-2:', res.body);
          res.body.should.have.status(400)
          res.body.should.have.property('message').to.be.equal("Email adress and password do not match")
          done();
        });
    });
    it('TC-101-3 Gebruiker bestaat niet', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({
          emailAdress: "k.morrororoij@server.com",
          password: "secret"
        })
        .end((err, res) => {
          console.log('Response body 101-3:', res.body);
          res.body.should.have.status(404)
          res.body.should.have.property('message')
          res.body.should.have.property('data').to.be.empty
          done();
        });
    });
    it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
      chai.request(server)
        .post('/api/login')
        .send({
          emailAdress: "m.vandullemen@server.nl",
          password: "secret"
        })
        .end((err, res) => {
          console.log('Response body 101-4:', res.body);
          res.body.should.have.property('code', 200); // Updated assertion
          res.body.should.have.property('message');
          res.body.should.have.property('data');
          const data = res.body.data;
          data.should.have.property('id').to.be.equal(1);
          data.should.have.property('token');

          done();
        });
    });
  });
});