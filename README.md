# phoneparser.js
This Javascript application uses Google's libphonenumber to parse a phone number.

## Installation

To install 
Go to https://nodejs.org/en/ and install the recommended for most user version of node js.
after installation. Download this repo and open command-line to the location.
Also have the tool Postman to see the post functions.

```sh
npm install 
```

## Quick start

#Starting the Server


```sh
npm index.js
```

Testing Get

# Get 

Open a browser and enter into the url "localhost:3000/api/phonenumbers/parse/text/Seneca%20Phone%20Number%3A%20416-491-5050"

it will show you the result
![GETResult](https://i.imgur.com/qlXVBEH.jpg)

# Post 

Open up Postman enter in the url http://localhost:3000/api/phonenumbers/parse/file and enter into the header 
key Content-Type value text/plain
![Postman Header](https://imgur.com/9SuDv0s.jpg)

The Body should be like this
![Postman Body](https://imgur.com/VGWYF75.jpg)
