'use strict';

// const mongoose = require('mongoose');
const AlexaSkill = require('../../models/alexa-skill-model');

const Graphic = require('../../models/graphic-model');

exports.graphic_to_db = async (data) => {
  let options = {skillId: data.skillId};
  let graph = await getOneGraphic(options);
  let graphOptions;

  if (!graph) {
    graphOptions = {
      skillId: data.skillId,
      intents: data.gintents,
      wires: data.gwires,
      preprocs: data.gpreprocs,
      branches: data.gbranches,
      slots: data.slots,
      intent_infos: data.gintent_infos,
      launchRequestIntent: data.launchRequestIntent
    };
    await Graphic.create(graphOptions);
  }
  else {
    graphOptions = {
      skillId: data.skillId,
      intents: data.gintents,
      wires: data.gwires,
      preprocs: data.gpreprocs,
      branches: data.gbranches,
      slots: data.slots,
      intent_infos: data.gintent_infos,
      launchRequestIntent: data.launchRequestIntent
    };
    await graph.update(graphOptions).exec();
  }
};

exports.alexa_skill_to_db = async (data) => {
  let skillName = data.skillName;
  let skillId = data.skillId;
  let skillStatusLink = data.skillStatusLink;
  let smallIconLink = data.smallIconLink;
  let largeIconLink = data.largeIconLink;

  let options = {name: skillName};
  let skill = await getOneAlexaSkill(options);
  console.log('skill db: ', skill);

  let dbData;
  let skillOptions;
  if (!skill) {
    skillOptions = {
      name: skillName,
      skillId: skillId,
      platform: 'alexa',
      skillStatusLink: skillStatusLink,
      smallIconLink: smallIconLink,
      largeIconLink: largeIconLink,
    };
    dbData = await AlexaSkill.create(skillOptions);
    console.log('new alexa skill created: ', dbData);
    return dbData;
  } else {
    skillOptions = {
      skillStatusLink: skillStatusLink,
      smallIconLink: smallIconLink,
      largeIconLink: largeIconLink,
      updated_date: Date.now(),
    };
    dbData = await skill.update(skillOptions).exec();
    let options = {name: skillName};
    let updatedSkill = await getOneAlexaSkill(options);
    console.log('updated new doc: ', updatedSkill);
    return updatedSkill;
  }
};

exports.get_all_alexa_skills = async () => {
  let skills = await AlexaSkill.find();
  // console.log('skill index: ', skills);
  return skills;
};

exports.get_one_alexa_skill = async (skillId) => {
  let options = {skillId: skillId};
  let skill = await getOneAlexaSkill(options);
  return skill;
};

exports.update_one_alexa_skill = async (skillId, updateAttr) => {
  let options = {skillId: skillId};
  let skill = await getOneAlexaSkill(options);

  let updateDB = await skill.update(updateAttr).exec();
  console.log(updateDB);

  let updatedSkill = await getOneAlexaSkill(options);
  console.log('updated new doc: ', updatedSkill);
  return updatedSkill;
};

let getOneAlexaSkill = async (options) => {
  let skill = await AlexaSkill.findOne(options, (err, data) => {
    console.log('getting data...');
    return data;
  });
  return skill;
};

let getOneGraphic = async (options) => {
  let skill = await Graphic.findOne(options, (err, data) => {
    console.log('getting data...');
    return data;
  });
  return skill;
};
