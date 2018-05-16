'use strict';

module.exports = (app) => {
  let home = require('../controller/home-controller');
  let skills = require('../controller/skills-controller');
  let alexaSkills = require('../controller/alexa-skills-controller');

  app.route('/')
    .get(home.index);

  app.route('/skills')
    .get(skills.index);

  app.route('/skills/alexa/new')
    .get(alexaSkills.create_get)
    .post(alexaSkills.create_post);
};
