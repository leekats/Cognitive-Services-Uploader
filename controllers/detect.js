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

var confidence = 0.5;
var resp;
var dir = 'C:\\catches\\';
var timeOut = 300;
var keyDir = "C:\\key.txt"
//var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

exports.detectFolder = function (req, res) {
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
        if (body == '[]') {
            console.log(id + " : " + "NO FACE");
        } else {
            console.log(id + " : " + JSON.parse(body)[0].faceId);
            identify(JSON.parse(body)[0].faceId, id);
        }
    });
}

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
        if (!(body[0].candidates[0])) {
            //resp.send("No faces matching");
            console.log(id + " : No faces matching");
        } else {
            //resp.send(response.body[0].candidates);
            console.log(id + " : " + body[0].candidates[0].personId);//[0].candidates + " : " + id);
        }
    });
}

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


function getKey() {
    return (fs.readFileSync(keyDir, 'utf8', function (err, data) {
        if (err) throw err;
        return data;
    }));
}