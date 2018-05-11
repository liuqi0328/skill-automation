'use strict';

const fs = require('fs');
const exec = require('child_process').execSync;

module.exports = function(data, skillDirectory, underscoreName) {
  console.log('build started...');

  if (!fs.existsSync(`${skillDirectory}/models`)) {
    fs.mkdirSync(`${skillDirectory}/models`);
  }
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
  fs.writeFileSync(`${skillDirectory}/project/package.json`, JSON.stringify(packageJSON));

  console.log('package.json saved!');

  let text = `TEST1\nTEST2\nTEST3\n`;
  fs.writeFileSync(`${skillDirectory}/skill.json`, text);

  console.log('skill.json saved!');

  // fs.createReadStream(shellScriptPath).pipe(fs.createWriteStream(`${skillDirectory}/project/create_package.sh`));

  // CHANGE PATH FOR NPM
  if (!fs.existsSync(`${skillDirectory}/project/submission`)) {
    exec(
      `cd ${skillDirectory}/project && npm i && mkdir submission && zip -X -r submission/index.zip * -x build build/* *.xlsx Skills Skills/* test test/* speechAssets speechAssets/* index.zip deploy.sh > /dev/null`
    );
  } else {
    exec(
      `cd ${skillDirectory}/project && npm i && zip -X -r submission/index.zip * -x build build/* *.xlsx Skills Skills/* test test/* speechAssets speechAssets/* index.zip deploy.sh > /dev/null`
    );
  }

  console.log('build finished...!');
};
