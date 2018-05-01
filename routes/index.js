var express = require('express');
var router = express.Router();
var detect = require('../controllers/detect.js');
var upload = require('../controllers/upload.js');
var stats = require('../controllers/stats.js');
var upnew = require('../controllers/upnew');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

router.get('/data', function(req, res, next) {
  res.render('report.html');
});

router.route('/detectFolder').post(detect.detectFolder);
router.route('/detectURL').post(detect.detectURL);

router.route('/upload').post(upload.up);
router.route('/upnew').post(upnew.up);
router.route('/stats').get(stats.report);

router.get('*',function (req, res) {
  res.redirect('/');
});

module.exports = router;
