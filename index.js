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
var AreaCodes = require('areacodes');
var acode = new AreaCodes();

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
//--------------------

function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    //build download link:
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);


    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } // end if(window.MSBlobBuilder) 



    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    }; // end if('download' in a) 



    //do iframe dataURL download: (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}



//---------------------
app.get('/api/phonenumbers/parse/text/:pString', function (req, res) {

  inString = req.params.pString;
  inString = decodeURIComponent(inString);
  inString = parser.render(inString);
  var phone = [];
  var numbers;
  numbers = phoneUtil.parse(inString, 'CA');
  phone.push(phoneUtil.format(numbers, PNF.INTERNATIONAL));

//---------------- The following code was found here: https://stackoverflow.com/questions/2496710/writing-files-in-node-js
	var fs = require('fs');
	fs.writeFile("PhoneOutput.txt", phone, function(err) {
		if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
	});
//---------------- The above code was found here: https://stackoverflow.com/questions/2496710/writing-files-in-node-js
  var phoneObject = {};
  phoneObject.phone = phone[0];
  acode.get(phone[0], (err, data) =>{
    if(err){
      res.send(err);
    }
    phoneObject.location = data;
  })
  res.send(phoneObject);
});

app.post('/api/phonenumbers/parse/file', upload.single('file'), function (req, res) {
  var phoneObject = [];
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
        var parsedPhoneArr = parseOutput(numArr);
        parsedPhoneArr.forEach((num, index, array) =>{
          acode.get(num, (err, data)=>{
            if(err){
              res.send(400).send("Error parsing text file");
            }
            phoneObject.push({
              phone: num,
              location: data
            })
          })
        })        
        res.status(200).send(phoneObject);
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
        var parsedPhoneArr = parseOutput(numArr);
        parsedPhoneArr.forEach((num, index, array) =>{
          acode.get(num, (err, data)=>{
            if(err){
              res.send(400).send("Error parsing text file");
            }
            phoneObject.push({
              phone: num,
              location: data
            })
          })
        })
        
        res.status(200).send(phoneObject);
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