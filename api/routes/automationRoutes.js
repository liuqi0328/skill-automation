'use strict';

module.exports = (app) => {
  let skillAutomation = require('../controllers/automationController');

  app.route('/skill_automation')
    .post(skillAutomation.create_skill);
};
