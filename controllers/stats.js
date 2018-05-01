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

var DetectInfoMDL = require('../models/DetectInfo');
DTINF = mongoose.model('1519117271575 dtinfs', DetectInfoMDL);
var UploadInfoMDL = require('../models/UploadPersonId');
UPINF = mongoose.model('1518957136635 upinfs', UploadInfoMDL);
var ret = [];

exports.report = function (req, res) {
    TotalImages(res);
}

function TotalImages(res) {
    DTINF.count({}, function (err, person) {
        if (err) console.log(err);
        ret.push({total:person});
        console.log("Total images: " + person + "\n");
        FaceDetected(res);
      });
}

function FaceDetected(res) {
    DTINF.count(
        {$nor:[{personId:'1'},
               {personId:'0'}
]}, function (err, person) {
        if (err) console.log(err);
        ret.push({detected:person});
        console.log("Total Faces Detected: " + person + "\n");
        FaceNotDetected(res);
      });
}

function FaceNotDetected(res) {
    DTINF.count({personId:'0'}, function (err, person) {
        if (err) console.log(err);
        ret.push({noface:person});
        console.log("Faces Not Detected: " + person + "\n");
        NoMatch(res);
      });
}

function NoMatch(res) {
    DTINF.count({personId:'1'}, function (err, person) {
        if (err) console.log(err);
        ret.push({nomatch:person});
        console.log("Wrong Faces: " + person + "\n");
        Verified(res);
      });
}

function Verified(res) {
    var succ = 0;
    var notsucc = 0;
    var unknown = 0;
    DTINF.find(
               {$nor:[{personId:'1'},
               {personId:'0'}
]}, function (err, person) {
        if (err) console.log(err);
        
        // var imgId,pId;
        // for (var x = 0; x < person.length; x++) {
        //     console.log(x);
        //     imgId = person[x].imgId.split("_")[0];
        //     pId = person[x].personId;
        //     if (imgId == 0){
        //         unknown++;
        //     } else {
        //         UPINF.findOne({personId:pId},function(err, person, x) {
        //             //console.log(person + " " + pId + " " + imgId + " " + x);
        //             console.log(" " +x);
        //         });
        //     }
        // }
        res.send("X");
      });
}