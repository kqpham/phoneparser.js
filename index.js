//import { PhoneNumber } from 'google-libphonenumber';

var express = require('express');
var app = express();
var port = 3000;
var inString;
var Parser = require("simple-text-parser");
var parser = new Parser();
var phoneReg = /[^\d]/;
var PNF = require('google-libphonenumber').PhoneNumberFormat;
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var Multer = require('multer');
var upload = Multer({ dest: 'uploads/' });
var fs = require('fs');
var fileUpload = require('express-fileupload');
var pdf = require('pdf-parse');


parser.addRule(phoneReg, '');

/* app.get('/', function (req, res) {
  res.redirect('/api/phonenumbers/parse/text/')
});*/
//create a server object:

app.get('/', function (req, res) {
  //res.status(400).send('[]');
  res.send('hello');
});

app.get('/api/phonenumbers/parse/text/:pString', function (req, res) {

  inString = req.params.pString;
  inString = decodeURIComponent(inString);
  inString = parser.render(inString);
  var phone = [];
  phone.push(inString);
  phone = phoneUtil.parse(inString, 'CA');
  phone = phoneUtil.format(phone, PNF.INTERNATIONAL);
  res.send(phone);


});

app.post('/api/phonenumbers/parse/file', upload.single('file'), function (req, res) {

  if (!req.file) {
    res.status(400).send('File not found');
  }

  else {
    var inFile = req.file.path;
    var datBuff = fs.readFileSync(inFile);

    fs.readFile(req.file.path, function (err, contents) {
      if (err) {
        res.status(500).send(err);
        return;
      }

      var fileText;
      var numArr = [];
      if (req.file.originalname.match(/.*.pdf/))  {
        pdf(contents).then(data => {
          fileText = data.text.toString('ascii');
          var tempNumArr = fileText.split('\n');

          numArr = tempNumArr.filter(function(x){
            return (x !== (undefined || null || ''));
          });
          
        });
      }
      else {
        fileText = contents.toString('ascii');
        
        var buf = Buffer.from(fileText, 'base64');
        var numbers = buf.toString('ascii');
        numArr = numbers.split('\n');
        console.log(numArr);
      }
      
      var phone = [];
      for (var i = 0; i < numArr.length; i++) {
        phone[i] = numArr[i];
        phone[i] = phoneUtil.parse(numArr[i], 'CA');
        phone[i] = phoneUtil.format(phone[i], PNF.INTERNATIONAL);
      }

      res.status(200).send(phone);
    });
   
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)

});
