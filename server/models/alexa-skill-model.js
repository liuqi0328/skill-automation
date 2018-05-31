'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AlexaSkillSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  skillId: {
    type: String,
    required: true,
  },
  skillStatusLink: {
    type: String,
  },
  interactionModelStatusLink: {
    type: Map,
    of: String,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  updated_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AlexaSkill', AlexaSkillSchema);
