'use strict';

function index(req, res) {
  console.log('skills index');
  res.render('skills/index');
}

exports.index = index;
