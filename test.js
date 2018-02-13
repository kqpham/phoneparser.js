var chai = require('chai');
var chaiHttp = require('chai-http');
var index = require('./index.js');
var should = chai.should();
var fs = require('fs');
var expect = chai.expect;

chai.use(chaiHttp);

// testing get blank inputs
describe('URI blank input Test /', function() {
    it('Checking root', (done) => {
        chai.request(index).get('/').end(function(err, res) {
            res.should.have.status(400);
            done();
        });
    });
});

/*describe('URI blank input Test /', function(){
    it('Checking blank', (done) => {
        chai.request(index).get('/api/phonenumbers/parse/text').end(function(err,res){
            res.should.have.status(400);
            done();
        });
    });
});*/

//testing get with number input
describe('URI Number Input /api/phonenumbers/parse/text', function(){
    it('Output should be +1 416-491-5050', (done) => {
        chai.request(index)
            .get('/api/phonenumbers/parse/text/Seneca%20Phone%20Number%3A%20416-491-5050')
            .end(function(err,res){
                res.should.have.status(200);
                console.log(res.body);
                res.body.should.be.a('array').that.include('4164915050');
                done();
            });
    });
});

//testing post with text file
describe('post with text file /api/phonenumbers/parse/file', function(){
    it('Output should be "+1 519-455-5050","+1 416-774-0123","+1 647-552-0123"', (done) => {
        chai.request(index)
        .post('/api/phonenumbers/parse/file')
        .set('Content-Type', 'text/plain')
        .attach('file', fs.readFileSync('phonenumbers.txt'),'phonenumbers.txt')
        .end(function(err,res){
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').that.include('+1 519-455-5050','+1 416-774-0123','+1 647-552-0123');
            done();
        });
    });
});