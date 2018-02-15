var express = require('express');
var router = express.Router();
var detect = require('../controllers/detect.js');
var upload = require('../controllers/upload.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

router.get('/data', function(req, res, next) {
  res.send("gg");
});

router.route('/detectFolder').post(detect.detectFolder);
router.route('/detectURL').post(detect.detectURL);

router.route('/upload').post(upload.up);

router.get('*',function (req, res) {
  res.redirect('/');
});

module.exports = router;
