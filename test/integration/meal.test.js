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


let token = 0;
let registeredMealId = 0;

describe('TC-301 Toevoegen van een maaltijd', () => {

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
  it('TC-301-1 Verplicht veld ontbreekt', (done) => {
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
        //cookId: 1,
        description: "Een heerlijke hamburger! Altijd goed voor tevreden gesmikkel!",
        allergenes: ""
      })
      .end((err, res) => {
        console.log('Response body 301-1:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(400);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-301-2 Niet ingelogd', (done) => {
    chai.request(server)
      .post('/api/meal')
      .send({
        isActive: 1,
        isVega: 0,
        isVegan: 0,
        isToTakeHome: 1,
        maxAmountOfParticipants: 2,
        price: "19.95",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNFe0c3pucAjpExbQmZzmRwfAjKPyHEhzSF-A-B-UbOA&s",
        cookId: 2,
        name: "Hamburger",
        description: "Een heerlijke hamburger! Altijd goed voor tevreden gesmikkel!",
        allergenes: ""
      })
      .end((err, res) => {
        console.log('Response body 301-2:', res.body);
        res.body.should.be.an('object');
        res.body.should.have.status(401);
        //res.body.should.has.property('status').to.be.equal(401);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });

    // after((done) => {
    //   chai
    //     .request(server)
    //     .post("/api/login")
    //     .send({ emailAdress: "m.vandullemen@server.nl", password: "secret" })
    //     .end((loginErr, loginRes) => {
    //       token = loginRes.body.data.token;
    //       logger.info(`Token created: ${token}`);
    //       done();
    //     });
    // });
  });


  it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
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
        name: "Hamburger",
        description: "Een heerlijke hamburger! Altijd goed voor tevreden gesmikkel!",
        allergenes: ""
      })
      .end((err, res) => {
        console.log('Response body 301-3:', res.body);
        res.body.should.has.status(201);
        res.body.should.has.property('message');
        res.body.should.has.property('data');

        registeredMealId = res.body.data.id;
        done();
      });
  })

  // it.only('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
  //   chai
  //     .request(server)
  //     .post('/api/user')
  //     .set("Authorization", `Bearer ${token}`)
  //     .send({
  //       isActive: 1,
  //       isVega: 0,
  //       isVegan: 0,
  //       isToTakeHome: 1,
  //       maxAmountOfParticipants: 2,
  //       price: "19.95",
  //       imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNFe0c3pucAjpExbQmZzmRwfAjKPyHEhzSF-A-B-UbOA&s",
  //       cookId: 1,
  //       name: "Hamburger",
  //       description: "Een heerlijke hamburger! Altijd goed voor tevreden gesmikkel!",
  //       allergenes: ""
  //     })
  //     .end((err, res) => {
  //       console.log('Response body 301-3:', res.body);
  //       res.body.should.be.an('object')
  //       res.body.should.has.property('status').to.be.equal(201);
  //       res.body.should.have.property('message');
  //       res.body.should.have.property('data').to.not.be.empty;
  //       let { isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes } = res.body.data;
  //       isActive.should.be.a('number').to.be.equal(1);
  //       isVega.should.be.a('number').to.be.equal(0);
  //       isVegan.should.be.a('number').to.be.equal(0);
  //       isToTakeHome.should.be.a('number').to.be.equal(1);
  //       maxAmountOfParticipants.should.be.a('number').to.be.equal(2);
  //       price.should.be.a('string').to.be.equal("19.95");
  //       imageUrl.should.be.a('string').to.be.equal("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNFe0c3pucAjpExbQmZzmRwfAjKPyHEhzSF-A-B-UbOA&s");
  //       cookId.should.be.a('number').to.be.equal(1);
  //       name.should.be.a('string').to.be.equal("Hamburger");
  //       description.should.be.a('string').to.be.equal("Een heerlijke hamburger! Altijd goed voor tevreden gesmikkel!");
  //       allergenes.should.be.a('string').to.be.equal("");
  //       //server.all.should.be.a('string').to.be.equal("")

  //       // Store the registered user ID
  //       registeredMealId = res.body.data.id;

  //       done();

  //     });
  // });
});

describe('TC-303 Opvragen van alle maaltijden', () => {
  it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
    chai.request(server)
      .get('/api/meal')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 303-1:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data').that.is.an('array').with.length.gte(2);
        const firstMeal = res.body.data[0];
        firstMeal.name.should.equal('Aubergine uit de oven met feta, muntrijst en tomatensaus');
        done();
      });
  })
});


describe('TC-304 Opvragen van maaltijden bij ID', () => {
  it('TC-304-1 Maaltijd bestaat niet', (done) => {
    chai.request(server)
      .get('/api/meal/34567898765456789')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 304-1:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(404);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
    chai.request(server)
      .get('/api/meal/2')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 304-2:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data');

        const firstMeal2 = res.body.data;
        firstMeal2.name.should.equal('Aubergine uit de oven met feta, muntrijst en tomatensaus');;
        done();
      });
  });
});

describe('TC-305 Verwijderen van maaltijd', () => {
  it('TC-305-1 Niet ingelogd', (done) => {
    chai.request(server)
      .delete(`/api/meal/${registeredMealId}`)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.status(401)
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-305-2 Niet de eigenaar van de data', (done) => {
    chai.request(server)
      .delete('/api/meal/2')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 305-2:', res.body);
        res.body.should.have.status(403);
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  it('TC-305-3 Maaltijd bestaat niet', (done) => {
    chai.request(server)
      .delete('/api/meal/213456789654567899876567')
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 305-3:', res.body);
        res.body.should.have.status(404)
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });

  // it.only('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
  //   chai.request(server)
  //     .delete(`/api/user/${registeredMealId}`)
  //     .set("Authorization", `Bearer ${token}`)
  //     .end((err, res) => {
  //       console.log('Response body 305-4:', res.body);
  //       res.body.should.have.status(200)
  //       chai.request(server)
  //         .get(`/api/user/${registeredMealId}`)
  //         .set("Authorization", `Bearer ${token}`)
  //         .end((err, res) => {
  //           res.should.have.status(404);
  //           res.body.should.has.property('data').to.be.empty;
  //           done();
  //         });
  //     });
  // });

  it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
    logger.info("Registered meal " , registeredMealId)
    logger.info("Token of registered user " , token)
    chai
      .request(server)
      .delete(`/api/meal/${registeredMealId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log('Response body 305-4:', res.body);
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data').to.be.empty;
        done();
      });
  });
});


