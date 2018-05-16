'use strict';

module.exports = (app) => {
  let home = require('../controller/home-controller');
  let skills = require('../controller/skills-controller');

  app.route('/')
    .get(home.index);

  app.route('/skills')
    .get(skills.index);

  app.route('/skills/new')
    .get(skills.create_get)
    .post(skills.create_post);
};
