'use strict';

const fs = require('fs');
const url = require('url');

// const path = require('path');
const filepath = process.cwd() + '/temp';

const createAlexaSkill = require('./helpers/amazon/create-alexa-skill');
const awsHelpers = require('./helpers/amazon/aws-helpers');
const dbHelpers = require('./helpers/db-helper');

const platformError = 'You need to choose a platform. Choose from: "alexa", "google", "cortana".';
let code;
let access_token;

// function index(req, res) {
//   console.log('skills index');
//   res.render('skills/index');
// }

function create_get(req, res) {
  console.log('skills create get');
  console.log('create skill get code: ', req.query.code);
  if (req.query.code) code = req.query.code;
  res.render('skills/alexa/new', {msg: ''});
}

async function create_post(req, res) {
  console.log('create skill post access token: ', access_token);
  console.log('req body: ', req.body);

  let data = req.body;
  let platform = data.platform;
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

  switch (platform) {
    case 'alexa':
      // CREATE FILES FOR SKILL CREATION/UPDATE
      createAlexaSkill.createSkillFiles(data, skillDirectory, underscoreName);
      console.log('authorization code: ', code);

      let accessToken = await createAlexaSkill.getAccessToken(code);
      access_token = accessToken.access_token;
      console.log('access token: ', access_token);

      await awsHelpers.deploy(data, skillDirectory, underscoreName);
      let skillData = await createAlexaSkill.create(skillDirectory, underscoreName, access_token);
      console.log('await skill data: ', skillData);

      let dbData = {
        skillName: underscoreName,
        skillId: skillData.skillId,
        skillStatusLink: skillData.statusLink,
      };
      console.log('final db data: ', dbData);
      let db = await dbHelpers.alexa_skill_to_db(dbData);
      console.log('final db entry: ', db);

      res.redirect(url.format({
        pathname: `/skills/alexa/${underscoreName}`,
        query: {
          skillName: skillName,
          skillId: skillData.skillId,
        },
      }));

      // // GET ACCESS TOKEN USING THE AUTHORIZATION CODE FROM LOGIN WITH AMAZON
      // createAlexaSkill.getAccessToken(code)
      //   .then((result) => {
      //     access_token = result.access_token;
      //     console.log('access token: ', access_token);

      //     // DEPLOY FUNCTION TO LAMBDA
      //     awsHelpers.deploy(data, skillDirectory, underscoreName)
      //       // CREATE SKILL IN ALEXA DEVELOPER PORTAL
      //       .then(() => {
      //         createAlexaSkill.create(skillDirectory, underscoreName, access_token)
      //           .then((result) => {
      //             let skillId = result;
      //             console.log(skillId);
      //             dbHelpers.alexa_skill_to_db(data);
      //             // // UPDATE INTERACTION MODELS
      //             // if (skillId) {
      //             //   for (let i = 0; i < arrayOfLocales.length; i++) {
      //             //     let locale = arrayOfLocales[i];
      //             //     console.log(locale + ' building...!');
      //             //     createAlexaSkill.updateInteractionModel(skillDirectory, skillId, locale, access_token);
      //             //   }
      //             // }
      //             // res.redirect(`/skills/alexa/${skillId}`);
      //             res.redirect(url.format({
      //               pathname: `/skills/alexa/${underscoreName}`,
      //               query: {
      //                 skillName: skillName,
      //                 skillId: skillId,
      //               },
      //             }));
      //           });
      //       });
      //   });
      break;
    case 'google':
    case 'cortana':
    default:
      return res.render('skills/alexa/new', {msg: platformError});
  }

  // let finishedMessage = {
  //   message: skillName + ' created!',
  // };

  // res.json(finishedMessage);
  // res.redirect('/skills');
}

function skill_get(req, res) {
  console.log('skill info page');
  console.log('req query: ', req.query);
  let skillId = req.query.skillId;
  let skillName = req.query.skillName;
  res.render('skills/alexa/skill', {skillName: skillName, skillId: skillId});
}

// exports.index = index;
exports.create_get = create_get;
exports.create_post = create_post;
exports.skill_get = skill_get;
