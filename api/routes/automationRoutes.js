'use strict';

module.exports = (app) => {
  let skillAutomation = require('../controllers/automationController');

  app.route('/skills')
    .post(skillAutomation.create_skill);
};
