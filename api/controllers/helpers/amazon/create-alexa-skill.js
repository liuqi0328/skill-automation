'use strict';

const fs = require('fs');
const exec = require('child_process').execSync;

module.exports = function(data, skillDirectory, underscoreName) {
  console.log('build started...!');

  // BUILD SKILL INTERACTION MODEL
  if (!fs.existsSync(`${skillDirectory}/models`)) {
    fs.mkdirSync(`${skillDirectory}/models`);
  }

  let intents = [];
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
  const summary = `TEST SUMMARY`;
  const description = `TEST DESCRIPTION`;
  const examplePhrases = [
    `Alexa, open ${skillName}.`,
  ];
  const category = 'test';
  const smallIconSrc = `https://s3.amazonaws.com/${underscoreName}/assets/images/108/${underscoreName}108.png`;
  const largeIconSrc = `https://s3.amazonaws.com/${underscoreName}/assets/images/512/${underscoreName}512.png`;
  const privacyPolicyUrl = 'https://www.freshdigitalgroup.com/privacy-policy-for-bots';
  const termsOfUseUrl = 'https://www.freshdigitalgroup.com/voice-applications-amazon-terms-of-use';

  const skillJSON = {
    'skillManifest': {
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
            'uri': `arn:aws:lambda:us-east-1:429365556200:${endPoint}:LIVE`,
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
    description: '',
    main: 'index.js',
    scripts: {
      test: 'echo \"Error: no test specified\" && exit 1',
      start: 'nodemon server.js',
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
