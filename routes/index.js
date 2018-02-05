var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/detect.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

router.get('/data', function(req, res, next) {
  res.send("gg");
});
router.route('/detect').post(ctrl.detectPOST);
//router.route('/identify').post(ctrl.identifyPOST);

router.get('*',function (req, res) {
  res.redirect('/');
});

module.exports = router;
