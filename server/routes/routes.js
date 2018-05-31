'use strict';

module.exports = (app) => {
  let home = require('../controller/home-controller');
  let skills = require('../controller/skills-controller');
  let alexaSkills = require('../controller/alexa-skills-controller');
  let googleActions = require('../controller/google-actions-controller');
  let cortanaSkills = require('../controller/cortana-skills-controller');

  app.route('/')
    .get(home.index);

  app.route('/skills')
    .get(skills.index);

  app.route('/skills/alexa/new')
    .get(alexaSkills.create_get)
    .post(alexaSkills.create_post);

  app.route('/skills/alexa/:skillName')
    .get(alexaSkills.skill_get);

  // app.route('/skills/google/new')
  //   .get(googleActions.create_get)
  //   .post(googleActions.create_post);

  // app.route('/skills/cortana/new')
  //   .get(cortanaSkills.create_get)
  //   .post(cortanaSkills.create_post);
};
