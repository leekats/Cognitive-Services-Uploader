var sleep = require('system-sleep');
var mongoose = require('mongoose');
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

// DB Models
var UploadErrorMDL = require('../models/UploadErrors');
var UploadPersonMDL = require('../models/UploadPersonId');
var UPERR;
var UPINF;

// Controller Variables
var dir = 'C:\\someimages3\\';  // Where the images are stored
var groupid = "test";           // Group's name
var timeOut = 300;              // The time to wait between calls
var keyDir = "C:\\key.txt"      // Where the key is stored
//var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

/*  The function gets called upon POST on /upload
    Goes through a folder and for each file, executes
    CreatePeroson -> AddAFace */
exports.up = function (req, res) {
    var dt = new Date().getTime();
    UPERR = mongoose.model(dt + " UPERR", UploadErrorMDL);
    UPINF = mongoose.model(dt + " UPINF", UploadPersonMDL);
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
            var errr = new UPERR({picId:personName,err:'Error creating person'});
            errr.save();
            console.log(personName + " : Error creating person")
        } else {
            var inf = new UPINF({picId:personName,personId:body.personId});
            inf.save();
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
        if (!(JSON.parse(body).persistedFaceId)) {
            var errr = new UPERR({picId:personName,err:'Error adding face'});
            errr.save();
            console.log(personName + " Error adding face");
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