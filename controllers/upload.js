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

var dir = 'C:\\someimages\\';
var groupid = "test";
var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

exports.up = function(req,res) {
    var files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        sleep(250);
        var pathToImg = dir + files[i];
        addToGroup(pathToImg, files[i].split(".")[0]);
    }
    res.send("sent");
}

function addToGroup (uri, personName) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/persongroups/'+groupid+'/persons/';
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: {
            'name':  personName
        },
        json: true
    }
    request.post(opts, function(error, response, body){
        addAFace(uri,body.personId);
    });
}

function addAFace(uri, personid){
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/persongroups/'+groupid+'/persons/'+personid+'/persistedFaces/';
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': getKey()
        },
        body: fs.readFileSync(uri),
    }

    request.post(opts, function(error, response, body) {
        console.log(body);
    });
}

function getKey() {
    return(fs.readFileSync(keyDir, 'utf8', function(err, data) {
        if (err) throw err;
            return data;
    }));
}