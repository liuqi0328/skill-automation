'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SkillAutomationFormSchema = new Schema({
  platform: {
    type: String,
    required: true,
    enum: ['alexa', 'google', 'cortana'],
  },
  skill_name: {
    type: String,
    required: true,
  },
  skill_manifest: {},
  skill_interaction_model: {},
  account_cred: {},
});

module.exports = mongoose.model('SkillAutomationForms',
                                SkillAutomationFormSchema);
