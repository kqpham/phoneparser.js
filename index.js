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

// Function for parsing numbers into
// Human readable phone numbers
function parseOutput(numArr) {
  var phone = [];
  for (var i = 0; i < numArr.length; i++) {
    phone[i] = numArr[i];
    phone[i] = phoneUtil.parse(numArr[i], 'CA');
    phone[i] = phoneUtil.format(phone[i], PNF.INTERNATIONAL);

  }
  return phone;

}

app.get('/', function (req, res) {
  res.status(400).send('[]');
});

app.get('/api/phonenumbers/parse/text/:pString', function (req, res) {

  inString = req.params.pString;
  inString = decodeURIComponent(inString);
  inString = parser.render(inString);
  var phone = [];
  var numbers;
  numbers = phoneUtil.parse(inString, 'CA');
  phone.push(phoneUtil.format(numbers, PNF.INTERNATIONAL));
  res.send(phone);

});

app.post('/api/phonenumbers/parse/file', upload.single('file'), function (req, res) {

  if (!req.file) {
    res.status(400).send('File not found');
  }

  else {
    var inFile = req.file.path;

    // Check if file is PDF
    if (req.file.originalname.match(/.*.pdf/)) {

      // Use pdfText to read the PDF file appropriately
      var dataBuffer = fs.readFileSync(inFile);
      pdf(dataBuffer).then(data => {
        var fileText = data.text.toString('ascii');
        var buf = Buffer.from(fileText, 'base64');
        var numbers = buf.toString('ascii');
        var numArr = numbers.split('\n');
        res.status(200).send(parseOutput(numArr));
      });

    }
    else {
      fs.readFile(inFile, function (err, contents) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        var fileText = contents.toString('ascii');
        var buf = Buffer.from(fileText, 'base64');
        var numbers = buf.toString('ascii');
        var numArr = numbers.split('\n');
        res.status(200).send(parseOutput(numArr));
      });

    }

  }
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)

});

module.exports = app;