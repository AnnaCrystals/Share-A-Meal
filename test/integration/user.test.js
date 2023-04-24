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
                    isActive: false,
                    //Email bewust weggelaten
                    //emailAddress: "d.devries11@avans.nl",
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
                    firstName: "Astolfo",
                    lastName: "Rider",
                    street: "road",
                    city: "Yggdmillennia",
                    isActive: false,
                    emailAddress: 'a.rider@avans.nl',
                    password: "callme",
                    phoneNumber: "1242146"
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.has.property('status', 201);
                    res.body.should.has.property('message');
                    res.body.should.has.property('data').to.not.be.empty;
                    let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data;
                    firstName.should.be.a('string').to.be.equal("Astolfo");
                    lastName.should.be.a('string').to.be.equal("Rider");
                    street.should.be.a('string').to.be.equal("road");
                    city.should.be.a('string').to.be.equal("Yggdmillennia");
                    isActive.should.be.a('boolean').to.be.equal(false);
                    emailAddress.should.be.a('string').to.be.equal("a.rider@avans.nl");
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
                    let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = res.body.data;
                    firstName.should.be.a('string').to.be.equal("Daan");
                    lastName.should.be.a('string').to.be.equal("de Vries");
                    street.should.be.a('string').to.be.equal("Frost");
                    city.should.be.a('string').to.be.equal("Snowland");
                    isActive.should.be.a('boolean').to.be.equal(false);
                    emailAddress.should.be.a('string').to.be.equal("d.devries11@avans.nl");
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
                    let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber  } = res.body.data;
                    firstName.should.be.a('string').to.be.equal("Janko");
                    lastName.should.be.a('string').to.be.equal("Seremak");
                    street.should.be.a('string').to.be.equal("Frost");
                    city.should.be.a('string').to.be.equal("Snowland");
                    isActive.should.be.a('boolean').to.be.equal(false);
                    emailAddress.should.be.a('string').to.be.equal("j.seremak@avans.nl");
                    password.should.be.a('string').to.be.equal("vriesvries");
                    phoneNumber.should.be.a('string').to.be.equal("06151544554");
                    done();
                });
        });

        it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
            chai
                .request(server)
                .delete('/api/user/3')
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
