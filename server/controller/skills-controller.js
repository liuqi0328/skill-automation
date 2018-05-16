'use strict';

function index(req, res) {
  console.log('skills index');
  res.render('skills/skills_index');
}

function create_get(req, res) {
  console.log('skills create get');
  res.render('skills/skills_new');
}

function create_post(req, res) {
  console.log('create skill post req: ', req.query.access_token);
  console.log('req body: ', req.body);
}

exports.index = index;
exports.create_get = create_get;
exports.create_post = create_post;
