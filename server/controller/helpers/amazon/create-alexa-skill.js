'use strict';

require('dotenv').config();

const fs = require('fs');
const exec = require('child_process').execSync;
const rp = require('request-promise');

const alexaBaseUrl = 'https://api.amazonalexa.com';
const vendorId = process.env.VENDOR_ID;

//ACE helpers~~
let findSlotNames = (utt) => {
  let slotNames = [];
  for (let i = 0; i < utt.length; i++) {
    let slotName = '';
    if (utt[i] == '{') {
      i++;
      while (utt[i] != '}') {
        slotName += utt[i];
        i++;
        if (i == utt.length)
          return 'err';
      }
      slotNames.push(slotName);
    }
  }
  return slotNames;
};

let createSkillFiles = (data, skillDirectory, underscoreName, finalData) => {
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

  // BUILD INTENTS
  let intents = [
    {
      'name': 'AMAZON.StopIntent',
      'samples': [],
    },
    {
      'name': 'AMAZON.CancelIntent',
      'samples': [],
    },
    {
      'name': 'AMAZON.HelpIntent',
      'samples': [],
    }
  ];

  let _intents = finalData.intents;
  for (let i = 0; i < _intents.length; i++) {
    
    //common intents
    if (i != finalData.launchRequest) {
      let utts = _intents[i].utt;
      let name = utts[0] + 'Intent';
      let slots = [];
      let samples = [];
      for (let j = 1; j < utts.length; j++) {
        samples.push(utts[j]);
        let slotNames = findSlotNames(utts[j]);
        if (slotNames == "err") {
          //ACE ERR: should check at front end
        }
        if (slotNames.length > 0) {
          for (let k = 0; k < slotNames.length; k++) {
            let slot = {"name": "", "type": ""};
            let index = finalData.slots.find((obj) => {
              return obj.name == slotNames[k];
            });
            slot.name = index.name;
            slot.type = index.type;
            slots.push(slot);
          }
        }
      }
      intents.push({'name': name, 'slots': slots, 'samples': samples});
    }

    //launch intent: don't need to handle
  }

  let types = [];
  let slots = finalData.slots;
  for (let i = 0; i < slots.length; i++) {
    let name = slots[i].type;
    let values = [];
    let _values = slots[i].values;
    for (let j = 0; j < _values.length; j++) {
      values.push({'name': {'value': _values[j]}});
    }
    types.push({"name": name, "values": values});
  }


  console.log(intents);
  console.log(types);

  // let inputIntents = data.intents;
  // if (inputIntents) {
  //   for (let i = 0; i < inputIntents.length; i++) {
  //     intents.push(inputIntents[i]);
  //   }
  // }

  // // BUILD SLOT TYPES
  // let types = [];
  // let inputTypes = data.types;
  // if (inputTypes) {
  //   for (let j = 0; j < inputTypes.length; j++) {
  //     types.push(inputTypes[j]);
  //   }
  // }

  // CREATE INTERACTION MODELS FOR LOCALES
  const skillName = underscoreName.replace(/_/g, ' ');
  const languages = data.locales;
  const interactionModel = {
    'interactionModel': {
      'languageModel': {
        'invocationName': skillName.toLowerCase(),
        'types': types,
        'intents': intents,
      },
    },
  };

  languages.forEach(function(language) {
    fs.writeFileSync(`${skillDirectory}/models/${language}.json`,
                     JSON.stringify(interactionModel));
  });

  console.log('interaction model saved...!');

  //process.kill(process.pid);

  // SKILL JSON
  const keyWord = [skillName];
  const endPoint = `function:${underscoreName}`;
  const testingInstructions = `TEST TESTING INSTRUCTIONS`;
  const summary = data.summary;
  const description = data.description;
  const examplePhrases = [
    `Alexa, open ${skillName}.`,
  ];
  const category = 'SMART_HOME'; // CHANGE CATEGORY
  const bucketName = underscoreName.replace(/_/g, '-');
  const smallIconSrc = `https://s3.amazonaws.com/${bucketName}/assets/images/108/${underscoreName}108.png`; // UPDATE SKILL ICON LINKS
  const largeIconSrc = `https://s3.amazonaws.com/${bucketName}/assets/images/512/${underscoreName}512.png`; // UPDATE SKILL ICON LINKS
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
      'bespoken-tools': '^1.0.5',
      'chai': '^3.5.0',
      'chai-string': '^1.4.0',
      'eslint': '^3.19.0',
      'eslint-config-airbnb-base': '^12.1.0',
      'eslint-config-google': '^0.8.0',
      'eslint-plugin-import': '^2.8.0',
      'eslint-plugin-json': '^1.2.0',
      'gulp': '^3.9.1',
      'gulp-eslint': '^3.0.1',
      'gulp-git': '^2.1.0',
      'gulp-jsbeautifier': '^2.1.2',
      'gulp-jshint': '^2.0.4',
      'gulp-mocha': '^4.3.1',
      'mocha': '^3.4.2',
      'run-sequence': '^1.2.2',
    },
    dependencies: {
      'ask-sdk': '^2.0.1',
    },
  };
  fs.writeFileSync(`${skillDirectory}/project/package.json`,
                   JSON.stringify(packageJSON));

  console.log('package.json saved...!');

  // CREATE index.js
  //
  //
  //
  // FINISH CREATING INDEX FILE
  let handlerString = '';
  let sourceCode =
`'use strict';
const Alexa = require('ask-sdk');
const unhandledMessage = 'I couldn\\'t understand what you said, please say it again.';
`
  for (let i = 0; i < _intents.length; i++) {
    let intent = _intents[i];
    let isLaunch = 1;
    if (i != finalData.launchRequest) {
      handlerString += `${intent.utt[0]}Handler, `;
      isLaunch = 0;
    }

    // PARSE INTENT INPUT TO INCLUDE SPEECH AND REPROMPT SPEECH
    sourceCode += createIntentHandler(intent, isLaunch, underscoreName);
  }

  handlerString += 'launchRequestHandler';

  sourceCode +=
`const SessionEndedHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('Session ended with reason: ' + handlerInput.requestEnvelope.request.reason);
    return handlerInput.responseBuilder.getResponse();
  },
};
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const request = handlerInput.requestEnvelope.request;
    console.log('Error handled: ' + error.message);
    console.log('Original request was ' + JSON.stringify(request, null, 2));

    return handlerInput.responseBuilder
      .speak(unhandledMessage)
      .reprompt(unhandledMessage)
      .getResponse();
  },
};
const PersistenceSavingResponseInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      let sessionAttributes =
        handlerInput.attributesManager.getSessionAttributes();
      handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);
      handlerInput.attributesManager.savePersistentAttributes()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(${handlerString}, SessionEndedHandler)
  .addErrorHandlers(ErrorHandler)
  .withTableName()
  .withAutoCreateTable(true)
  .lambda();`;
console.log('===============ACE================');
console.log(sourceCode);
  fs.writeFileSync(`${skillDirectory}/project/index.js`, sourceCode);
  // fs.createReadStream(shellScriptPath).pipe(fs.createWriteStream(`${skillDirectory}/project/create_package.sh`));

  //process.kill(process.pid);

  // NPM BUILD
  if (!fs.existsSync(`${skillDirectory}/project/submission`)) {
    exec(`cd ${skillDirectory}/project && npm i && mkdir submission && zip -r -X submission/index.zip * > /dev/null`);
  } else {
    exec(`cd ${skillDirectory}/project && npm i && zip -r -X submission/index.zip * > /dev/null`);
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

let createSkill = (skillDirectory, accessToken) => {
  let skillManifest =
    JSON.parse(fs.readFileSync(`${skillDirectory}/skill.json`, 'utf8'));
  let createSkillOptions = {
    method: 'POST',
    uri: alexaBaseUrl + '/v1/skills',
    headers: {
      'Authorization': accessToken,
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
      // return result.body.skillId;
      let data = {
        skillId: result.body.skillId,
        statusLink: result.headers.location,
      };
      return data;
    })
    .catch((error) => {
      // console.error(error);
      console.log('create skill error: ', error.message);
      return error;
    });
};

let updateSkill = (skillDirectory, skillId, accessToken) => {
  let skillManifest =
    JSON.parse(fs.readFileSync(`${skillDirectory}/skill.json`, 'utf8'));
  delete skillManifest.vendorId;

  console.log('skill manifest update: ', skillManifest);

  let updateSkillOptions = {
    method: 'PUT',
    uri: alexaBaseUrl + `/v1/skills/${skillId}/stages/development/manifest`,
    headers: {
      'Authorization': accessToken,
    },
    body: skillManifest,
    json: true,
    resolveWithFullResponse: true,
  };
  return rp(updateSkillOptions)
    .then((result) => {
      console.log('update skill api result headers: ', result.headers);
      console.log('update skill api result body: ', result.body);
      let data = {
        skillId: skillId,
        statusLink: result.headers.location,
      };
      return data;
    })
    .catch((error) => {
      // console.error(error);
      console.log('update skill error: ', error.message);
      return error;
    });
};

let checkExistingSkill = (underscoreName, accessToken) => {
  const skillName = underscoreName.replace(/_/g, ' ');
  let checkOptions = {
    method: 'GET',
    uri: alexaBaseUrl + `/v1/skills?vendorId=${vendorId}`,
    headers: {
      'Authorization': accessToken,
    },
    json: true,
    // resolveWithFullResponse: true,
  };
  return rp(checkOptions)
    .then((result) => {
      // console.log('skill list: ', result);
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

let updateInteractionModel = async (interactionModelDirectory, skillId, locale, accessToken) => {
  // let allLocales = ['en-US', 'en-AU', 'en-GB', 'en-IN', 'en-CA'];
  // if (!allLocales.includes(locale)) {
  //   console.log('Incorrect locale...');
  //   return 'locale error';
  // }
  let interactionModel = 
    JSON.parse(fs.readFileSync(`${interactionModelDirectory}/${locale}.json`, 'utf8'));
  let updateInteractionModelOptions = {
    method: 'PUT',
    uri: alexaBaseUrl +
      `/v1/skills/${skillId}/stages/development/interactionModel/locales/${locale}`,
    headers: {
      'Authorization': accessToken,
    },
    body: JSON.stringify(interactionModel),
    //json: true,
    resolveWithFullResponse: true,
  };
  console.log('url: ', updateInteractionModelOptions.uri);
  console.log('body: ', updateInteractionModelOptions.body);

  return rp(updateInteractionModelOptions)
    .then((result) => {
      console.log('update interaction model api result headers: ', result.headers);
      console.log('update interaction model api result body: ', result.body);
      return result;
    })
    .catch((error) => {
      // console.error(error);
      console.log('update interaction model error: ', error.message, error.stack);
      return 'error';
    });
};

let create = async (skillDirectory, underscoreName, accessToken) => {
  let skillId;
  let data;
  let check = await checkExistingSkill(underscoreName, accessToken);
  if (check) {
    skillId = check.skillId;
    data = await updateSkill(skillDirectory, skillId, accessToken);
  } else {
    data = await createSkill(skillDirectory, accessToken);
  }
  return data;
};

let checkManifestStatus = (url, accessToken) => {
  let checkOptions = {
    method: 'GET',
    uri: alexaBaseUrl + url,
    headers: {
      'Authorization': accessToken,
    },
    json: true,
    // resolveWithFullResponse: true,
  };
  return rp(checkOptions)
    .then((result) => {
      console.log('manifest status check: ', result);
      console.log('manifest status check: ', result.manifest.lastUpdateRequest.errors);
      return result;
    })
    .catch((err) => {
      console.log('manifest status check err: ', err);
      return err;
    });
};

exports.createSkillFiles = createSkillFiles;
// exports.createSkill = createSkill;
exports.getAccessToken = getAccessToken;
// exports.checkExistingSkill = checkExistingSkill;
exports.updateInteractionModel = updateInteractionModel;
exports.create = create;
exports.checkManifestStatus = checkManifestStatus;

//handlerInput.attributesManager.getSessionAttributes();

function createIntentHandler(intent, isLaunch, underscoreName) {
  
  let handler;

  let branches = '';

  for (let i = 0; i < intent.branches.length; i++) {
    
    branches += intent.branches[i];
    branches += '\n';
  }

  //console.log(isLaunch);

  if (isLaunch == 1) {

    //console.log("here");

    handler = 
`
const launchRequestHandler = {
  canHandle (handlerInput) {
    console.log('ACE checked');
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle (handlerInput) {

    let sessionData = {'stage': ${intent.stage}};
    handlerInput.attributesManager.setSessionAttributes(sessionData);

    let resp = '';
    
    ${intent.preproc}

    ${branches}

    return handlerInput.responseBuilder
        .speak(resp)
        .reprompt(resp)
        .withSimpleCard('${underscoreName}', resp)
        .getResponse();
  }
};
`;
  }
  else {

    //console.log("here1");

    let stagesEq = '';

    let i;

    for (i = 0; i < intent.parentStages.length - 1; i++) {

      stagesEq += `stage == ${intent.parentStages[i]} || `; 
    }

    stagesEq += `stage == ${intent.parentStages[i]}`;

    if (intent.parentStages.length == 0) 
      stagesEq = 'true';

    handler = 
`
const ${intent.utt[0]}Handler = {
  canHandle (handlerInput) {
    
    let stage = handlerInput.attributesManager.getSessionAttributes().stage;

    if (${stagesEq}) {

      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === '${intent.utt[0]}Intent';
    }
    else 
      return false;
  },
  handle (handlerInput) {

    let sessionData = handlerInput.attributesManager.getSessionAttributes();
    sessionData.stage = ${intent.stage};
    handlerInput.attributesManager.setSessionAttributes(sessionData);

    let resp = '';
    
    ${intent.preproc}

    ${branches}

    return handlerInput.responseBuilder
        .speak(resp)
        .reprompt(resp)
        .withSimpleCard('${underscoreName}', resp)
        .getResponse();
  }
};
`;
  }

  return handler;
}
