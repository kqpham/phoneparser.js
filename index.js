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
var pdfText = require('pdf-text');

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

app.post('/api/phonenumbers/parse/file', upload.single('file'), async function (req, res) {

  if (!req.file) {
    res.status(400).send('File not found');
  }

  else {
    var inFile = req.file.path;

    // Check if file is PDF
    if (req.file.originalname.match(/.*.pdf/)) {

      // Use pdfText to read the PDF file appropriately
      pdfText(inFile, function (err, chunks) {
        res.status(200).send(parseOutput(chunks));
      });

    }
    else {
      var fileContents = fs.readFileSync(inFile); // Read the contents of the file
      // Convert file into base64 format, then to ascii string, then split on newline
      var numbers = Buffer.from(fileContents, 'base64').toString('ascii').split('\n');
      res.status(200).send(parseOutput(numbers));
    }

  }
});


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)

});
