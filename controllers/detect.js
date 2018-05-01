var sleep = require('system-sleep');
var express = require('express');
var mongoose = require('mongoose');
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
var DetectInfoMDL = require('../models/DetectInfo');
var DetectErrorMDL = require('../models/DetectNot');
var DTINF;
var DTERR;

var confidence = 0.5;        // Confidence of the Identification
var resp;                    // Response object
var dir = 'C:\\catches2\\';  // The directory of the images to detect
var timeOut = 300;           // The time to wait between calls
var keyDir = "C:\\key.txt"   // Where the key is stored
//var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

/*  The function gets called upon POST on /detectFolder
    It runs through a folder and executes detectBinary,
    For each file in the folder */
exports.detectFolder = function (req, res) {
    var dt = new Date().getTime();
    DTINF = mongoose.model(dt + " DTINF", DetectInfoMDL);
    DTERR = mongoose.model(dt + " DTERR", DetectErrorMDL);
    try {
        var files = fs.readdirSync(dir);
        for (var i = 0; i < files.length; i++) {
            sleep(timeOut);
            var pathToImg = dir + files[i];
            detectBinary(pathToImg, files[i].split(".")[0]);
        }
    } catch (err) {
        console.log(err);
    }
    res.send("sent");
}

/*  Detects a face from a given binary picture
    On successfull face detection, calls identify
    * uri = Local URL of the picture
    * id  = File name */
function detectBinary(uri, id) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true';
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: fs.readFileSync(uri)
    }
    request.post(opts, function (error, response, body) {
        // If no face detected
        if (body == '[]') {
            var errr = new DTERR({ imgId: id });
            errr.save();
            var inf = new DTINF({ imgId: id, personId: '0' });
            inf.save();
            console.log(id + " Couldn't identify")
            // Calls identify if we detected a face
        } else {
            identify(JSON.parse(body)[0].faceId, id);
        }
    });
}

/*  Identifies a face from given faceId
    * faceId = given faceId of the person
    * id     = Filename */
function identify(faceId, id) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/identify'
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: {
            "personGroupId": "test",
            "faceIds": [
                faceId
            ],
            "maxNumOfCandidatesReturned": 1,
            "confidenceThreshold": confidence
        },
        json: true
    }
    request.post(opts, function (error, response, body) {
        // If the face isn't in the group
        if (!(body[0])) {
            //resp.send("No faces matching");
            var inf = new DTINF({ imgId: id, personId: '1' });
            inf.save();
            // If the face is in the group
        } else if (body[0].candidates[0]) {
            //resp.send(response.body[0].candidates);
            var inf = new DTINF({ imgId: id, personId: body[0].candidates[0].personId, conf: body[0].candidates[0].confidence });
            inf.save();
        } else {
            var inf = new DTINF({ imgId: id, personId: '1' });
            inf.save();
            console.log(id + " : No faces matching");            
        }
    });
}

/*  The function gets called upon POST on /detectURL
    It checks if the image is valid, and calls detect */
exports.detectURL = function (req, res) {
    resp = res;
    if (req.body.ur == "") {
        res.send("NO URL");
    } else {
        request.get({ url: req.body.ur }, function (error, response, body) {
            if ((response && response.statusCode) != 200) {
                res.send("IMAGE NOT VALID");
            } else {
                detect(req.body.ur);
            }
        });
    }
};

//  Detects a face from given URL
function detect(uri) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true'
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: {
            url: uri
        },
        json: true
    }
    request.post(opts, function (error, response, body) {
        //console.log(response.body[0].faceId);
        identify(response.body[0].faceId);
    });
};

// Gets the sub key from the local machine
function getKey() {
    return (fs.readFileSync(keyDir, 'utf8', function (err, data) {
        if (err) throw err;
        return data;
    }));
}