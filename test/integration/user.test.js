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
                    firstName: 'Daan',
                    lastName: 'de Vries',
                    //Email bewust weggelaten
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
                    firstName: 'Robin',
                    lastName: 'Schellius',
                    emailAddress: 'r.schellius@avans.nl'
                })
                .end((err, res) => {
                    res.body.should.be.an('object')
                    res.body.should.has.property('status', 201);
                    res.body.should.has.property('message');
                    res.body.should.has.property('data').to.not.be.empty;
                    let { firstName, lastName, emailAddress } = res.body.data;
                    firstName.should.be.a('string').to.be.equal('Robin');
                    lastName.should.be.a('string').to.be.equal('Schellius');
                    emailAddress.should.be.a('string').to.be.equal('r.schellius@avans.nl');
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
                    let { firstName, lastName, emailAddress } = res.body.data;
                    firstName.should.be.a('string').to.be.equal('Daan');
                    lastName.should.be.a('string').to.be.equal('de Vries');
                    emailAddress.should.be.a('string').to.be.equal('d.devries11@avans.nl');
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
                    let { firstName, lastName, emailAddress } = res.body.data;
                    firstName.should.be.a('string').to.be.equal('Janko');
                    lastName.should.be.a('string').to.be.equal('Seremak');
                    emailAddress.should.be.a('string').to.be.equal('j.seremak@avans.nl');
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
