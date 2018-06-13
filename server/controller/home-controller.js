'use strict';

function index(req, res) {
  console.log('Hello World!');
  res.render('home/index', {title: 'Hello World'});
}

exports.index = index;

