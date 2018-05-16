'use strict';

const fs = require('fs');
const exec = require('child_process').execSync;
const rp = require('request-promise');

const alexaBaseUrl = 'https://api.amazonalexa.com';
const vendorId = 'M2LCJQMQ8K0T24';

let createSkillFiles = (data, skillDirectory, underscoreName) => {
  console.log('build started...!');

  // // ASK CONFIG
  // const askConfig = {
  //   'deploy_settings': {
  //     'default': {
  //       'skill_id': skillId,
  //       'was_cloned': false,
  //       'merge': {
  //         'skillManifest': {
  //           'apis': {
  //             'custom': {
  //               'endpoint': {
  //                 'uri': `${endPoint}:LIVE`,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // };

  // BUILD SKILL INTERACTION MODEL
  if (!fs.existsSync(`${skillDirectory}/models`)) {
    fs.mkdirSync(`${skillDirectory}/models`);
  }

  let intents = [
    {
      'name': 'GetNewFactIntent',
      'slots': [],
      'samples': [
        'Give me a fact',
        'tell me a fact',
      ],
    },
  ];
  const skillName = underscoreName.replace(/_/g, ' ');
  const languages = ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN'];
  const interactionModel = {
    'interactionModel': {
      'languageModel': {
        'invocationName': skillName.toLowerCase(),
        'types': [],
        'intents': intents,
      },
    },
  };

  languages.forEach(function(language) {
    fs.writeFileSync(`${skillDirectory}/models/${language}.json`,
                     JSON.stringify(interactionModel));
  });

  console.log('interaction model saved...!');

  // SKILL JSON
  /**
   * !!!!!!!!!!!!!!!!!!!!!UPDATE ICON URL!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   */
  const keyWord = [skillName];
  const endPoint = `function:${underscoreName}`;
  const testingInstructions = `TEST TESTING INSTRUCTIONS`;
  const summary = data.summary;
  const description = data.description;
  const examplePhrases = [
    `Alexa, open ${skillName}.`,
  ];
  const category = 'SMART_HOME';
  const imageName = underscoreName.replace(/_/g, '-');
  const smallIconSrc = `https://s3.amazonaws.com/${imageName}/assets/images/108/${imageName}108.png`;
  const largeIconSrc = `https://s3.amazonaws.com/${imageName}/assets/images/512/${imageName}512.png`;
  const privacyPolicyUrl = 'https://www.freshdigitalgroup.com/privacy-policy-for-bots';
  const termsOfUseUrl = 'https://www.freshdigitalgroup.com/voice-applications-amazon-terms-of-use';

  const skillJSON = {
    'vendorId': vendorId,
    'manifest': {
      'publishingInformation': {
        'locales': {
          'en-US': {
              'summary': summary,
              'examplePhrases': examplePhrases,
              'keywords': keyWord,
              'smallIconUri': smallIconSrc,
              'largeIconUri': largeIconSrc,
              'name': skillName,
              'description': description,
          },
          'en-GB': {
              'summary': summary,
              'examplePhrases': examplePhrases,
              'keywords': keyWord,
              'smallIconUri': smallIconSrc,
              'largeIconUri': largeIconSrc,
              'name': skillName,
              'description': description,
          },
          'en-AU': {
              'summary': summary,
              'examplePhrases': examplePhrases,
              'keywords': keyWord,
              'smallIconUri': smallIconSrc,
              'largeIconUri': largeIconSrc,
              'name': skillName,
              'description': description,
          },
          'en-CA': {
              'summary': summary,
              'examplePhrases': examplePhrases,
              'keywords': keyWord,
              'smallIconUri': smallIconSrc,
              'largeIconUri': largeIconSrc,
              'name': skillName,
              'description': description,
          },
          'en-IN': {
              'summary': summary,
              'examplePhrases': examplePhrases,
              'keywords': keyWord,
              'smallIconUri': smallIconSrc,
              'largeIconUri': largeIconSrc,
              'name': skillName,
              'description': description,
          },
        },
        'isAvailableWorldwide': true,
        'testingInstructions': testingInstructions,
        'category': category,
        'distributionCountries': [],
      },
      'apis': {
        'custom': {
          'endpoint': {
            'uri': `arn:aws:lambda:us-east-1:429365556200:${endPoint}`,
          },
        },
      },
      'manifestVersion': '1.0',
      'privacyAndCompliance': {
        'allowsPurchases': false,
        'usesPersonalInfo': false,
        'isChildDirected': false,
        'isExportCompliant': true,
        'containsAds': false,
        'locales': {
          'en-US': {
            'privacyPolicyUrl': privacyPolicyUrl,
            'termsOfUseUrl': termsOfUseUrl,
          },
          'en-GB': {
            'privacyPolicyUrl': privacyPolicyUrl,
            'termsOfUseUrl': termsOfUseUrl,
          },
          'en-AU': {
            'privacyPolicyUrl': privacyPolicyUrl,
            'termsOfUseUrl': termsOfUseUrl,
          },
          'en-CA': {
            'privacyPolicyUrl': privacyPolicyUrl,
            'termsOfUseUrl': termsOfUseUrl,
          },
          'en-IN': {
            'privacyPolicyUrl': privacyPolicyUrl,
            'termsOfUseUrl': termsOfUseUrl,
          },
        },
      },
    },
  };
  fs.writeFileSync(`${skillDirectory}/skill.json`,
                   JSON.stringify(skillJSON));

  console.log('skill.json saved...!');

  // BUILD SKILL LOGIC
  if (!fs.existsSync(`${skillDirectory}/project`)) {
    fs.mkdirSync(`${skillDirectory}/project`);
  }

  // UPDATE PACKAGE DEPENDENCIES
  let packageJSON = {
    name: underscoreName,
    version: '1.0.0',
    description: description,
    main: 'index.js',
    scripts: {
      test: 'echo \"Error: no test specified\" && exit 1',
    },
    author: 'Fresh Digital Group',
    license: 'ISC',
    devDependencies: {
      nodemon: '^1.17.4',
    },
    dependencies: {
      express: '^4.16.3',
      mongoose: '^5.0.17',
    },
  };
  fs.writeFileSync(`${skillDirectory}/project/package.json`,
                   JSON.stringify(packageJSON));

  console.log('package.json saved...!');

  // fs.createReadStream(shellScriptPath).pipe(fs.createWriteStream(`${skillDirectory}/project/create_package.sh`));

  // NPM BUILD
  if (!fs.existsSync(`${skillDirectory}/project/submission`)) {
    exec(`cd ${skillDirectory}/project && npm i && mkdir submission && zip -X -r submission/index.zip * -x build build/* *.xlsx Skills Skills/* test test/* speechAssets speechAssets/* index.zip deploy.sh > /dev/null`);
  } else {
    exec(`cd ${skillDirectory}/project && npm i && zip -X -r submission/index.zip * -x build build/* *.xlsx Skills Skills/* test test/* speechAssets speechAssets/* index.zip deploy.sh > /dev/null`);
  }

  console.log('build finished...!');
};

let getAccessToken = (code) => {
  let options = {
    method: 'POST',
    uri: 'https://api.amazon.com/auth/o2/token',
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded',
    // },
    body: {
      grant_type: 'authorization_code',
      code: code,
      client_id:
        'amzn1.application-oa2-client.097ffe4a4e0444ab88c76af39d6ba8be',
      client_secret:
        '9f4fb4781fcd061f8557bfadf9766bcd83ea1a76ad0d8af3e6ad02ccd136a66d',
    },
    json: true,
  };
  console.log(options);
  return rp(options)
    .then((result) => {
      console.log('access token api result: ', result);
      return result;
    })
    .catch((error) => {
      // console.error(error);
      console.log('access token api error: ', error.message);
      return error;
    });
};

let createSkill = (skillDirectory, access_token) => {
  let skillManifest =
    JSON.parse(fs.readFileSync(`${skillDirectory}/skill.json`, 'utf8'));
  let createSkillOptions = {
    method: 'POST',
    uri: alexaBaseUrl + '/v1/skills',
    headers: {
      Authorization: access_token,
    },
    body: skillManifest,
    json: true,
    resolveWithFullResponse: true,
  };
  console.log(createSkillOptions);
  return rp(createSkillOptions)
    .then((result) => {
      console.log('create skill api result headers: ', result.headers);
      console.log('create skill api result body: ', result.body);
      return result;
    })
    .catch((error) => {
      // console.error(error);
      console.log('create skill error: ', error.message);
      return error;
    });
};

let updateSkill = (skillDirectory, skillId, access_token) => {
  let skillManifest =
    JSON.parse(fs.readFileSync(`${skillDirectory}/skill.json`, 'utf8'));
  delete skillManifest.vendorId;

  console.log('skill manifest update: ', skillManifest);

  let updateSkillOptions = {
    method: 'PUT',
    uri: alexaBaseUrl + `/v1/skills/${skillId}/stages/development/manifest`,
    headers: {
      Authorization: access_token,
    },
    body: skillManifest,
    json: true,
    resolveWithFullResponse: true,
  };
  return rp(updateSkillOptions)
    .then((result) => {
      console.log('update skill api result headers: ', result.headers);
      console.log('update skill api result body: ', result.body);
      return result;
    })
    .catch((error) => {
      // console.error(error);
      console.log('update skill error: ', error.message);
      return error;
    });
};

let checkExistingSkill = (underscoreName, access_token) => {
  const skillName = underscoreName.replace(/_/g, ' ');
  let checkOptions = {
    method: 'GET',
    uri: alexaBaseUrl + `/v1/skills?vendorId=${vendorId}`,
    headers: {
      Authorization: access_token,
    },
    json: true,
    // resolveWithFullResponse: true,
  };
  return rp(checkOptions)
    .then((result) => {
      console.log('skill list: ', result);
      let skills = result.skills;
      let existingSkill = skills.find((skill) => {
        return (skill.nameByLocale['en-US']
            || skill.nameByLocale['en-AU']
            || skill.nameByLocale['en-GB']
            || skill.nameByLocale['en-IN']
            || skill.nameByLocale['en-CA']) === skillName;
      });
      console.log('existing skill: ', existingSkill);
      return existingSkill;
    })
    .catch((err) => {
      console.error(err);
      return '';
    });
};

let updateInteractionModel = (skillDirectory, skillId, access_token) => {
  let interactionModel =
    JSON.parse(fs.readFileSync(`${skillDirectory}/models/en-US.json`, 'utf8'));
  let updateInteractionModelOptions = {
    method: 'PUT',
    uri: alexaBaseUrl +
      `/v1/skills/${skillId}/stages/development/interactionModel/locales/en-US`,
    headers: {
      Authorization: access_token,
    },
    body: interactionModel,
    json: true,
    resolveWithFullResponse: true,
  };
  return rp(updateInteractionModelOptions)
    .then((result) => {
      console.log('update interaction model api result headers: ', result.headers);
      console.log('update interaction model api result body: ', result.body);
      return result;
    })
    .catch((error) => {
      // console.error(error);
      console.log('update interaction model error: ', error.message);
      return error;
    });
};

let create = (skillDirectory, underscoreName, access_token) => {
  checkExistingSkill(underscoreName, access_token)
    .then((result) => {
      let existingSkill = result;
      if (existingSkill) {
        let skillId = existingSkill.skillId;
        updateSkill(skillDirectory, skillId, access_token)
          .then(() => updateInteractionModel(skillDirectory, skillId, access_token));
      } else {
        createSkill(skillDirectory, access_token);
      }
    });
};

exports.createSkillFiles = createSkillFiles;
exports.createSkill = createSkill;
exports.getAccessToken = getAccessToken;
exports.checkExistingSkill = checkExistingSkill;
exports.create = create;
