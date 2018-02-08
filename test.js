var chai = require('chai');

var expect = chai.expect;
var app = require('./index.js');
var fs = require('fs');
chai.use(require('chai-http'));
// testing get blank inputs
describe('URI blank input Test /', function(){
    it('Checking root', function(){
        return chai.request(app).get('/').end(function(err,res){
            expect(res).to.have.status(400);

        });
    });
});
describe('URI blank input Test /', function(){
    it('Checking blank', function(){
        return chai.request(app).get('/api/phonenumbers/parse/text').end(function(err,res){
            expect(res).to.have.status(400);
        });
    });
});

//testing get with number input
describe('URI Number Input /api/phonenumbers/parse/text', function(){
    it('Output should be +1 416-491-5050', function(){
        return chai.request(app).get('/api/phonenumbers/parse/text').end(function(err,res){
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').that.include('+1 416-491-5050');
        });
    });
});

//testing post with text file
describe('post with text file /api/phonenumbers/parse/file', function(){
    it('Output should be "+1 519-455-5050","+1 416-774-0123","+1 647-552-0123"', function(){
        return chai.request(app)
        .post('/api/phonenumbers/parse/file')
        .set('Content-Type', 'text/plain')
        .attach('file', fs.readFileSync('./phonenumbers.txt','phonenumbers.txt'))
        .then(function(err,res){
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').that.include('+1 519-455-5050','+1 416-774-0123','+1 647-552-0123');
        });
    });
});