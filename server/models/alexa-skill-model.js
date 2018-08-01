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

let GraphicSchema = new Schema({
  skillId: {
    type: String,
    required: true
  },
  intents: {
    type: Array,
    required: true
  },
  wires: {
    type: Array,
    required: true
  },
  preprocs: {
    type: Array,
    required: true
  },
  branches: {
    type: Array,
    required: true
  },
  slots: {
    type: Array,
    required: true
  },
  intent_infos: {
    type: Array,
    required: true
  },
  launchRequestIntent: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('AlexaSkill', AlexaSkillSchema); 
//module.exports.Graphic = mongoose.model('Graphic', GraphicSchema);
