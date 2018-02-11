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

var confidence = 0.4;
var resp;
var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

exports.upload = function(req,res) {
    res.send("asd");
}

exports.detectPOST = function(req, res) {
    resp = res;
    if (req.body.ur == "") {
        res.send("NO URL");
    } else {
        request.get({url:req.body.ur}, function(error, response, body){
            if ((response && response.statusCode) != 200){
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
    request.post(opts, function(error, response, body) {
        //console.log(response.body[0].faceId);
        identify(response.body[0].faceId);
    });
};

function identify(faceId) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/identify'
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: {
            "personGroupId":"test",
            "faceIds": [
                faceId
            ],
            "maxNumOfCandidatesReturned":1,
            "confidenceThreshold": confidence
        },
        json: true
    }
    request.post(opts, function(error, response, body) {
        //console.log(response.body[0].candidates);
        if (false){
            resp.send("No faces matching");
        } else {
            resp.send(response.body[0].candidates);
        }
    });
}

function getKey() {
    return(fs.readFileSync(keyDir, 'utf8', function(err, data) {
        if (err) throw err;
            return data;
    }));
}