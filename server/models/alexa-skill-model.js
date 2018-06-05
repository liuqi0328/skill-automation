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
    type: String,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  updated_date: {
    type: Date,
    default: Date.now,
  },
  plaform: {
    type: String,
    default: 'alexa',
  },
  s3Key: {
    type: String,
  },
  skill_manifest_updated: {
    type: Date,
  },
  interaction_model_updated: {
    type: Map,
    of: String,
  },
  smallIconLink: {
    type: String,
  },
  largeIconLink: {
    type: String,
  },
});

module.exports = mongoose.model('AlexaSkill', AlexaSkillSchema);
