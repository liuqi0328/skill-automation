'use strict';

// const mongoose = require('mongoose');
const AlexaSkill = require('../../models/alexa-skill-model');

exports.alexa_skill_to_db = async (data) => {
  let skillName = data.skillName;
  let skillId = data.skillId;
  let skillStatusLink = data.skillStatusLink;

  let skill = await AlexaSkill.findOne({name: skillName}, (data) => {
    console.log('getting data...');
    return data;
  });
  console.log('skill db: ', skill);
  let dbData;
  if (!skill) {
    dbData = await AlexaSkill.create({
      name: skillName,
      skillId: skillId,
      skillStatusLink: skillStatusLink,
    });
    console.log('new alexa skill created: ', dbData);
    return dbData;
  } else {
    // return skill;
    dbData = await skill.update({skillStatusLink: skillStatusLink, platform: 'alexa', updated_date: Date.now()}).exec();
    let updatedSkill = await AlexaSkill.findOne({name: skillName}, (data) => {
      console.log('getting updated data...');
      return data;
    });
    console.log('updated new doc: ', updatedSkill);
    return updatedSkill;
  }
};

exports.get_all_alexa_skills = async () => {
  let skills = await AlexaSkill.find();
  console.log('skill index: ', skills);
  return skills;
};
