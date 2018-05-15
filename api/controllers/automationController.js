'use strict';

const fs = require('fs');
// const exec = require('child_process').execSync;

// AMAZON HELPERS
const createAlexaSkillManifest = require('./helpers/amazon/create-alexa-skill');
const awsHelpers = require('./helpers/amazon/aws-helpers');

// GOOGLE HELPERS
// MICROSOFT HELPERS

const filepath = process.cwd() + '/temp';
// const shellScriptPath = process.cwd() + '/utils/create_package.sh';

exports.create_skill = (req, res) => {
  let data = req.body;
  let platform = data.platform;
  let skillName = data.skill_name;
  let underscoreName = skillName.replace(/\ /g, '_');
  let skillDirectory = filepath + '/' + underscoreName;

  if (!platform) {
    let err = {
      message: 'You need to choose a platform.',
    };
    return res.send(err);
  } else {
    console.log('platform: ', platform);
  }

  if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);
  if (!fs.existsSync(skillDirectory)) fs.mkdirSync(skillDirectory);

  switch (platform) {
    case 'alexa':
      createAlexaSkillManifest(data, skillDirectory, underscoreName);
      // awsHelpers.deploy(data, skillDirectory, underscoreName);
      break;
    case 'google':
    case 'cortana':
  }

  let message = {
    message: skillName + ' created!',
  };
  res.send(message);
};
