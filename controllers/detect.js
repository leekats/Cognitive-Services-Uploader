var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

exports.upload = function(req,res) {
    res.send("asd");
}

exports.detectPOST = function(req, res) {

    if (req.body.ur == "") {
        res.send("NO URL");
    } else {
        request.get({url:req.body.ur}, function(error, response, body){
            if ((response && response.statusCode) != 200){
                res.send("IMAGE NOT VALID");
            } else {
                res.send(detect(req.body.ur));
            }
        });
    }
};

detect = function(url) {
    return ("detect");
};

identify = function(faceid) {

}