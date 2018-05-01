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
var dir = 'C:\\Users\\Lee\\Desktop\\Rest\\';  // Where the images are stored
var groupid = "hashm";           // Group's name
var timeOut = 200;                 // The time to wait between calls
var keyDir = "C:\\key.txt"         // Where the key is stored
var Key = getKey();
var map = createMap();

//var keyDir = "D:\\home\\site\\wwwroot\\key.txt";

/*  The function gets called upon POST on /upload
    Goes through a folder and for each file, executes
    CreatePeroson -> AddAFace */
exports.up = function (req, res) {
    var dt = new Date().getTime();
    UPERR = mongoose.model(dt + " upnewerrs", UploadErrorMDL);
    UPINF = mongoose.model("1523772891473 upnewinfs", UploadPersonMDL);
    var files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        sleep(timeOut);
        var imgs = fs.readdirSync(dir + files[i] + "\\");
        CreatePerson(files[i], imgs);
        console.log(i);
    }
    res.send("sent");
}

/*  Creates a Person for each picture,
    With person name = picture id
    Upon successful creation, calls AddAFace 
    * iamges     = Local URL of the picture (needed for AddAFace)
    * personName = person's ID */
function CreatePerson(personName, images) {
    var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/largepersongroups/' + groupid + '/persons/';
    var opts = {
        url: u,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': Key
        },
        body: {
            'name': whiteDuck(personName)
        },
        json: true
    }
    request.post(opts, function (error, response, body) {
        if (!(body.personId)) {
            var errr = new UPERR({ picId: personName, err: 'Error creating person' });
            errr.save();
            console.log(personName + " : Error creating person")
        } else {
            var inf = new UPINF({ picId: personName, personId: body.personId });
            inf.save();
            addAFace(images, body.personId, personName);
        }
    });
}

/*  Adds a face to a person
    * images     = face images of the person
    * personid   = PersonID to add his face
    * personName = The ID of the real person */
function addAFace(images, personid, personName) {
    for (var x = 0; x < images.length; x++) {
        sleep(timeOut);
        var u = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/largepersongroups/' + groupid + '/persons/' + personid + '/persistedFaces/';
        var opts = {
            url: u,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': Key
            },
            body: fs.readFileSync(dir + personName + "\\" + images[x]),
        }

        request.post(opts, function (error, response, body) {
            if (!(JSON.parse(body).persistedFaceId)) {
                var errr = new UPERR({ picId: personName, err: 'Error adding face' });
                errr.save();
                console.log(personName + " Error adding face");
            }
        });
    }
}


// Gets the sub key from the local machine
function getKey() {
    return (fs.readFileSync(keyDir, 'utf8', function (err, data) {
        if (err) throw err;
        return data;
    }));
}

function whiteDuck(id) {

    var random = Math.floor(Math.random() * 8) + 2;
    var afterMul = (random * id).toString();
    var hash = random.toString();

    for (var x = 0; x < afterMul.length; x++) {
        hash += map.get(Number(afterMul.charAt(x)));
    }

    return hash;
}

function createMap() {

    var map = new Map();
    map.set(0, "a");
    map.set(1, "b");
    map.set(2, "c");
    map.set(3, "d");
    map.set(4, "e");
    map.set(5, "f");
    map.set(6, "g");
    map.set(7, "h");
    map.set(8, "i");
    map.set(9, "j");
    return map;
}
