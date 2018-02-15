var sleep = require('system-sleep');
var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var dir = 'C:\\someimages3\\';  // Where the images are stored
var groupid = "test";           // Group's name
var timeOut = 300;              // The time to wait between calls
var keyDir = "C:\\key.txt"      // Where the key is stored
//var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

/*  The function gets called upon POST on /upload
    Goes through a folder and for each file, executes
    CreatePeroson -> AddAFace */
exports.up = function (req, res) {
    var files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        sleep(timeOut);
        var pathToImg = dir + files[i];
        CreatePerson(pathToImg, files[i].split(".")[0]);
    }
    res.send("sent");
}

/*  Creates a Person for each picture,
    With person name = picture id
    Upon successful creation, calls AddAFace 
    * uri        = Local URL of the picture (needed for AddAFace)
    * personName = person's ID */
function CreatePerson(uri, personName) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/persongroups/' + groupid + '/persons/';
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: {
            'name': personName
        },
        json: true
    }
    request.post(opts, function (error, response, body) {
        sleep(100);
        if (!(body.personId)) {
            console.log(personName + " : Error creating person")
        } else {
            console.log(personName + " : " + body.personId);
            addAFace(uri, body.personId, personName);
        }
    });
}

/*  Adds a face to a person
    * uri        = Local URL of the picture to upload
    * personid   = PersonID to add his face
    * personName = The ID of the real person */
function addAFace(uri, personid, personName) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/persongroups/' + groupid + '/persons/' + personid + '/persistedFaces/';
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: fs.readFileSync(uri),
    }

    request.post(opts, function (error, response, body) {
        if (JSON.parse(body).persistedFaceId) {
            console.log(personName + " : Added face");
        } else {
            console.log("Error adding face")
        }
    });
}


// Gets the sub key from the local machine
function getKey() {
    return (fs.readFileSync(keyDir, 'utf8', function (err, data) {
        if (err) throw err;
        return data;
    }));
}