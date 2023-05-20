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


before((done) => {
  chai
    .request(server)
    .post("/api/login")
    .send({ emailAdress: "m.vandullemen@server.nl", password: "secret" })
    .end((loginErr, loginRes) => {
      token = loginRes.body.data.token;
      logger.info(`Token created: ${token}`);
      done();
    });
});

  describe('TC-301 Toevoegen van een maaltijd', () => {
    it.skip('TC-301-1 Verplicht veld ontbreekt', (done) => {
      chai.request(server)
        .post('/api/meal')
        .set("Authorization", `Bearer ${token}`)
        .send({
          isActive: 1,
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: "19.95",
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNFe0c3pucAjpExbQmZzmRwfAjKPyHEhzSF-A-B-UbOA&s",
          cookId: 2,
          description: "Een heerlijke hamburger! Altijd goed voor tevreden gesmikkel!",
          allergenes: ""
        })
        .end((err, res) => {
          res.body.should.be.an('object');
          res.body.should.has.property('status').to.be.equal(400);
          res.body.should.has.property('message');
          res.body.should.has.property('data').to.be.empty;
          done();
        });
    });



  });



