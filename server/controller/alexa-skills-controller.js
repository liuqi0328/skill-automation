'use strict';

const fs = require('fs');
const url = require('url');
const formidable = require('formidable');

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

  // let s3 = await awsHelpers.awsS3listbuckets();
  // console.log(s3);

  if (!access_token) {
    let accessToken = await createAlexaSkill.getAccessToken(code);
    access_token = accessToken.access_token;
  }
  // access_token = accessToken.access_token;
  console.log('skill index access token: ', access_token);

  let skills = await dbHelpers.get_all_alexa_skills();
  // console.log('final skills list: ', skills);
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
  // console.log('req body: ', req.body);

  // let data = req.body;
  // // let platform = data.platform;
  // let skillName = data.skill_name;
  // // BUILD LOCALES
  // let inputLocales = data.locales;
  // let seperator = /\s*,\s*/;
  // let arrayOfLocales = [];
  // if (inputLocales) {
  //   arrayOfLocales = inputLocales.split(seperator);
  // } else {
  //   arrayOfLocales.push('en-US');
  // }
  // data.locales = arrayOfLocales;

  // // CREATE TEMP DIRECTORY FOR SOURCE CODE
  // let underscoreName = skillName.replace(/\ /g, '_');
  // let skillDirectory = filepath + '/' + underscoreName;

  // CREATE TEMP DIRECTORY TO SAVE ICON IMAGE
  let iconTempDirectory = filepath + '/icons';
  if (!fs.existsSync(iconTempDirectory)) fs.mkdirSync(iconTempDirectory);

  console.log('---------------------------------');
  let form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    console.log('fields: ', fields);
    console.log('files: ', files);

    let oldpath = files.small_icon.path;
    let newpath = iconTempDirectory + '/' + files.small_icon.name;
    fs.renameSync(oldpath, newpath);
    console.log('small icon saved to temp...!');

    let largeoldpath = files.large_icon.path;
    let largenewpath = iconTempDirectory + '/' + files.large_icon.name;
    fs.renameSync(largeoldpath, largenewpath);
    console.log('large icon saved to temp...!');

    let data = fields;
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

    // CREATE TEMP DIRECTORY FOR SOURCE CODE
    let underscoreName = skillName.replace(/\ /g, '_');
    let skillDirectory = filepath + '/' + underscoreName;

    let icons = await awsHelpers.uploadIconToS3(newpath,
                                                largenewpath,
                                                underscoreName);

    console.log('icon........ ', icons);
    console.log('end..............!!!!!');

    if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);
    if (!fs.existsSync(skillDirectory)) fs.mkdirSync(skillDirectory);

    // CREATE FILES FOR SKILL CREATION/UPDATE
    createAlexaSkill.createSkillFiles(data,
                                      skillDirectory,
                                      underscoreName);

    console.log('authorization code: ', code);
    console.log('access token: ', access_token);

    await awsHelpers.deploy(data, skillDirectory, underscoreName);
    let skillData = await createAlexaSkill.create(skillDirectory,
                                                  underscoreName,
                                                  access_token);
    console.log('await skill data: ', skillData);

    let bucketName = underscoreName.replace(/_/g, '-');
    let dbData = {
      skillName: underscoreName,
      skillId: skillData.skillId,
      skillStatusLink: skillData.statusLink,
      smallIconLink: `https://s3.amazonaws.com/${bucketName}/assets/images/108/${underscoreName}108.png`,
      largeIconLink: `https://s3.amazonaws.com/${bucketName}/assets/images/512/${underscoreName}512.png`,
    };
    console.log('final db data: ', dbData);
    let db = await dbHelpers.alexa_skill_to_db(dbData);
    console.log('final db entry: ', db);

    awsHelpers.addFileToS3(skillDirectory, underscoreName);

    res.redirect('/skills/alexa');
  });


  // =========================================================================
  //   fs.rename(oldpath, newpath, (err) => {
  //     if (err) {
  //       console.error('small icon file write err: ', err);
  //       res.redirect('/skills/alexa');
  //     } else {
  //       console.log('small icon file write success!');

  //       let largeoldpath = files.large_icon.path;
  //       let largenewpath = iconTempDirectory + '/' + files.large_icon.name;

  //       fs.rename(largeoldpath, largenewpath, async (err) => {
  //         if (err) {
  //           console.error('large icon file write err: ', err);
  //         } else {
  //           console.log('large icon file write success!');
  //         }

  //         let data = fields;
  //         // let platform = data.platform;
  //         let skillName = data.skill_name;
  //         // BUILD LOCALES
  //         let inputLocales = data.locales;
  //         let seperator = /\s*,\s*/;
  //         let arrayOfLocales = [];
  //         if (inputLocales) {
  //           arrayOfLocales = inputLocales.split(seperator);
  //         } else {
  //           arrayOfLocales.push('en-US');
  //         }
  //         data.locales = arrayOfLocales;

  //         // CREATE TEMP DIRECTORY FOR SOURCE CODE
  //         let underscoreName = skillName.replace(/\ /g, '_');
  //         let skillDirectory = filepath + '/' + underscoreName;

  //         let icons = await awsHelpers.uploadIconToS3(newpath,
  //                                                     largenewpath,
  //                                                     underscoreName);

  //         console.log('icon........ ', icons);
  //         console.log('end..............!!!!!');

  //         if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);
  //         if (!fs.existsSync(skillDirectory)) fs.mkdirSync(skillDirectory);

  //         // CREATE FILES FOR SKILL CREATION/UPDATE
  //         createAlexaSkill.createSkillFiles(data,
  //                                           skillDirectory,
  //                                           underscoreName);

  //         console.log('authorization code: ', code);
  //         console.log('access token: ', access_token);

  //         await awsHelpers.deploy(data, skillDirectory, underscoreName);
  //         let skillData = await createAlexaSkill.create(skillDirectory,
  //                                                       underscoreName,
  //                                                       access_token);
  //         console.log('await skill data: ', skillData);

  //         let bucketName = underscoreName.replace(/_/g, '-');
  //         let dbData = {
  //           skillName: underscoreName,
  //           skillId: skillData.skillId,
  //           skillStatusLink: skillData.statusLink,
  //           smallIconLink: `https://s3.amazonaws.com/${bucketName}/assets/images/108/${underscoreName}108.png`,
  //           largeIconLink: `https://s3.amazonaws.com/${bucketName}/assets/images/512/${underscoreName}512.png`,
  //         };
  //         console.log('final db data: ', dbData);
  //         let db = await dbHelpers.alexa_skill_to_db(dbData);
  //         console.log('final db entry: ', db);

  //         awsHelpers.addFileToS3(skillDirectory, underscoreName);

  //         res.redirect('/skills/alexa');
  //       });
  //     }
  //   });
  // });


  // ==========================================================================

  // if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);
  // if (!fs.existsSync(skillDirectory)) fs.mkdirSync(skillDirectory);

  // // CREATE FILES FOR SKILL CREATION/UPDATE
  // createAlexaSkill.createSkillFiles(data, skillDirectory, underscoreName);

  // console.log('authorization code: ', code);
  // console.log('access token: ', access_token);

  // await awsHelpers.deploy(data, skillDirectory, underscoreName);
  // let skillData =
  //   await createAlexaSkill.create(skillDirectory, underscoreName, access_token);
  // console.log('await skill data: ', skillData);

  // let dbData = {
  //   skillName: underscoreName,
  //   skillId: skillData.skillId,
  //   skillStatusLink: skillData.statusLink,
  // };
  // console.log('final db data: ', dbData);
  // let db = await dbHelpers.alexa_skill_to_db(dbData);
  // console.log('final db entry: ', db);

  // awsHelpers.addFileToS3(skillDirectory, underscoreName);

  // res.redirect('/skills/alexa');
};

exports.skill_get = async (req, res) => {
  console.log('skill info page');
  console.log('req query: ', req.query);
  let skillId = req.query.skillId;
  let skill = await dbHelpers.get_one_alexa_skill(skillId);
  let skillName = skill.name;
  let manifestStatusLink = skill.skillStatusLink;
  let result = await createAlexaSkill.checkManifestStatus(manifestStatusLink,
                                                          access_token);
  let status = result.manifest.lastUpdateRequest.status;
  if (status === 'err') res.redirect('/skills/alexa');
  if (status === 'SUCCEEDED') {
    let updateAttr = {skill_manifest_updated: Date.now()};
    let updatedSkill = await dbHelpers.update_one_alexa_skill(skillId,
                                                              updateAttr);
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
      createAlexaSkill.updateInteractionModel(interactionModelDirectory,
                                              skillId,
                                              locale,
                                              access_token)
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
