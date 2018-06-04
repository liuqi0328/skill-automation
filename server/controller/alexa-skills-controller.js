'use strict';

const fs = require('fs');
const url = require('url');

// const path = require('path');
const filepath = process.cwd() + '/temp';

const createAlexaSkill = require('./helpers/amazon/create-alexa-skill');
const awsHelpers = require('./helpers/amazon/aws-helpers');
const dbHelpers = require('./helpers/db-helper');

const platformError =
  'You need to choose a platform. Choose from: "alexa", "google", "cortana".';
let code;
let access_token;

// function index(req, res) {
//   console.log('skills index');
//   res.render('skills/index');
// }

exports.index = async (req, res) => {
  console.log('skill index');
  console.log('skill index code: ', req.query.code);
  if (req.query.code) {
    code = req.query.code;
  }

  if (!access_token) {
    let accessToken = await createAlexaSkill.getAccessToken(code);
    access_token = accessToken.access_token;
  }
  // access_token = accessToken.access_token;
  console.log('skill index access token: ', access_token);

  let skills = await dbHelpers.get_all_alexa_skills();
  console.log('final skills list: ', skills);
  res.render('skills/alexa/index', {data: skills, access_token: access_token});
};

exports.create_get = (req, res) => {
  console.log('skills create get');
  // console.log('create skill get code: ', req.query.code);
  // if (req.query.code) code = req.query.code;
  res.render('skills/alexa/new', {msg: ''});
};

exports.create_post = async (req, res) => {
  console.log('create skill post access token: ', access_token);
  console.log('req body: ', req.body);

  let data = req.body;
  // let platform = data.platform;
  let skillName = data.skill_name;
  // BUILD LOCALES
  let inputLocales = data.locales;
  let seperator = /\s*,\s*/;
  let arrayOfLocales = [];
  if (inputLocales) {
    arrayOfLocales = inputLocales.split(seperator);
  } else {
    arrayOfLocales.push('en-US');
  }
  data.locales = arrayOfLocales;
  let underscoreName = skillName.replace(/\ /g, '_');
  let skillDirectory = filepath + '/' + underscoreName;

  if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);
  if (!fs.existsSync(skillDirectory)) fs.mkdirSync(skillDirectory);

  // CREATE FILES FOR SKILL CREATION/UPDATE
  createAlexaSkill.createSkillFiles(data, skillDirectory, underscoreName);

  console.log('authorization code: ', code);
  console.log('access token: ', access_token);

  await awsHelpers.deploy(data, skillDirectory, underscoreName);
  let skillData =
    await createAlexaSkill.create(skillDirectory, underscoreName, access_token);
  console.log('await skill data: ', skillData);

  let dbData = {
    skillName: underscoreName,
    skillId: skillData.skillId,
    skillStatusLink: skillData.statusLink,
  };
  console.log('final db data: ', dbData);
  let db = await dbHelpers.alexa_skill_to_db(dbData);
  console.log('final db entry: ', db);

  awsHelpers.addFileToS3(skillDirectory, underscoreName);

  res.redirect('/skills/alexa');
  // res.redirect(url.format({
  //   pathname: `/skills/alexa/${underscoreName}`,
  //   query: {
  //     skillName: skillName,
  //     skillId: skillData.skillId,
  //   },
  // }));
};

exports.skill_get = async (req, res) => {
  console.log('skill info page');
  console.log('req query: ', req.query);
  let skillId = req.query.skillId;
  let skill = await dbHelpers.get_one_alexa_skill(skillId);
  let skillName = skill.name;
  let manifestStatusLink = skill.skillStatusLink;
  let result = await createAlexaSkill.checkManifestStatus(manifestStatusLink, access_token);
  let status = result.manifest.lastUpdateRequest.status;
  if (status === 'err') res.redirect('/skills/alexa');
  if (status === 'SUCCEEDED') {
    let updateAttr = {skill_manifest_updated: Date.now()};
    let updatedSkill = await dbHelpers.update_one_alexa_skill(skillId, updateAttr);
    console.log(updatedSkill);
  }

  res.render('skills/alexa/skill',
             {skillName: skillName, skillId: skillId, status: status});
};

exports.skill_build_model = async (req, res) => {
  console.log('skill build interaction model');
  console.log('req query: ', req.query);
  let skillId = req.query.skillId;
  let skill = await dbHelpers.get_one_alexa_skill(skillId);
  let skillName = skill.name;
  let underscoreName = skillName.replace(/\ /g, '_');
  let interactionModelDirectory = `${filepath}/${underscoreName}/models`;

  fs.readdir(interactionModelDirectory, (err, files) => {
    if (err) console.error('Could not list the directory: ', err);
    for (let key = 0; key < files.length; key++) {
      if (files[key] === '.DS_Store') continue;
      let locale = files[key];
      locale = locale.replace('.json', '');
      createAlexaSkill.updateInteractionModel(interactionModelDirectory, skillId, locale, access_token)
        .then((result) => {
          let url = result.headers.location;
          let updateAttr = {interactionModelStatusLink: url};
          dbHelpers.update_one_alexa_skill(skillId, updateAttr)
            .then((result) => {
              console.log('updated interaction model link...');
            });
        })
        .catch((err) => {
          console.error('interaction model status err: ', err);
          // res.redirect(url.format({
          //   pathname: `/skills/alexa/${underscoreName}`,
          //   query: {
          //     skillName: skillName,
          //     skillId: skillId,
          //   },
          // }));
        });
    }
  });

  res.redirect('/skills/alexa');
};

