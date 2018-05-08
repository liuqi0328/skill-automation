'use strict';

const fs = require('fs');

// const exec = require('child_process').exec;
const exec = require('child_process').execSync;
// let child_process = require('child_process');
// const filepath = '../../temp';
// const cmd = require('node-cmd');

const filepath = process.cwd() + '/temp';
const shellScriptPath = process.cwd() + '/utils/create_package.sh';

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
    res.send(err);
  }

  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
  }
  if (!fs.existsSync(skillDirectory)) {
    fs.mkdirSync(skillDirectory);
  }

  switch (platform) {
    case 'alexa':
      createAlexaSkillManifest(data, skillDirectory);
      break;
    case 'google':
    case 'cortana':
  }

  let message = {
    message: skillName + ' created!',
  };
  res.send(message);
};

function createAlexaSkillManifest(data, skillDirectory) {
  if (!fs.existsSync(`${skillDirectory}/models`)) {
    fs.mkdirSync(`${skillDirectory}/models`);
  }
  if (!fs.existsSync(`${skillDirectory}/project`)) {
    fs.mkdirSync(`${skillDirectory}/project`);
  }

  let packageJSON = `{
  "name": "2018_skill_automation",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "start": "nodemon server.js"
  },
  "author": "Fresh Digital Group",
  "license": "ISC",
  "devDependencies": {
    "nodemon": "^1.17.4"
  },
  "dependencies": {
    "express": "^4.16.3",
    "mongoose": "^5.0.17"
  }
}`;
  fs.writeFileSync(`${skillDirectory}/project/package.json`, packageJSON);
  console.log('package.json saved!');

  let text = `TEST1\nTEST2\nTEST3\n`;
  fs.writeFileSync(`${skillDirectory}/skill.json`, text);
  console.log('skill.json saved!');

  // fs.createReadStream(shellScriptPath).pipe(fs.createWriteStream(`${skillDirectory}/project/create_package.sh`));


  exec(
    `cd ${skillDirectory}/project && npm i && mkdir submission && zip -X -r submission/index.zip * -x build build/* *.xlsx Skills Skills/* test test/* speechAssets speechAssets/* index.zip deploy.sh > /dev/null`,
    { env: { ...process.env } },
  );

  console.log('done...!');
}
