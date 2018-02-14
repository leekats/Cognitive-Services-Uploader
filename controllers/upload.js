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

var dir = 'C:\\someimages3\\';
var groupid = "test";
var timeOut = 300;
var keyDir = "C:\\key.txt"
//var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

exports.up = function (req, res) {
    var files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        sleep(timeOut);
        var pathToImg = dir + files[i];
        CreatePerson(pathToImg, files[i].split(".")[0]);
    }
    res.send("sent");
}

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

function getKey() {
    return (fs.readFileSync(keyDir, 'utf8', function (err, data) {
        if (err) throw err;
        return data;
    }));
}