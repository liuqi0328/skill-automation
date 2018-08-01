'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = mongoose.model('Graphic', GraphicSchema);