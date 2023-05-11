const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
chai.should();
chai.use(chaiHttp);

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

        it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    id: 17,
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
                    console.log(res.body);
                    res.body.should.be.an('object')
                    res.body.should.has.property('status', 201);
                    res.body.should.has.property('message');
                    res.body.should.has.property('data').to.not.be.empty;
                    let { id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber } = res.body.data;
                    id.should.be.equal(17);
                    firstName.should.be.a('string').to.be.equal("Astolfo");
                    lastName.should.be.a('string').to.be.equal("Rider");
                    street.should.be.a('string').to.be.equal("road");
                    city.should.be.a('string').to.be.equal("Yggdmillennia");
                    //isActive.should.be.a('integer').to.be.equal(1);
                    emailAdress.should.be.a('string').to.be.equal("a.rider@avans.nl");
                    password.should.be.a('string').to.be.equal("callme");
                    phoneNumber.should.be.a('string').to.be.equal("1242146");
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
                    firstName.should.be.a('string').to.be.equal("Daan");
                    lastName.should.be.a('string').to.be.equal("de Vries");
                    street.should.be.a('string').to.be.equal("Frost");
                    city.should.be.a('string').to.be.equal("Snowland");
                    isActive.should.be.a('integer').to.be.equal(1);
                    emailAdress.should.be.a('string').to.be.equal("d.devries11@avans.nl");
                    password.should.be.a('string').to.be.equal("vriesvries");
                    phoneNumber.should.be.a('string').to.be.equal("06151544554");
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
                .delete('/api/user/17')
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.has.property('status', 200);
                    res.body.should.has.property('message');
                    res.body.should.has.property('data').to.be.empty
                    done();
                });
        });
    });
});