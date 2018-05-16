'use strict';

module.exports = (app) => {
  let skillAutomation = require('../controllers/automationController');

  app.route('/api/v1/skills')
    .post(skillAutomation.create_skill);
};
