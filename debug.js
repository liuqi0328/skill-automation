const rp = require('request-promise');
const fs = require('fs');

const filepath = process.cwd() + '/temp';

let locales = ['en-US', 'en-AU', 'en-CA', 'en-GB', 'en-IN'];
let skillId = 'amzn1.ask.skill.1878df9d-2112-41ad-b663-2a607c70b856';
let accessToken = 'Atza|IwEBICUrNps_b7hYY9Se65yUYQYWUYqlpet6kTrl4X0yIZfkREpm0p3hT6gnq4Bq2dT2YHG_nCypZQ3P4sjSpkNjU1safQRXBNYEyY0kOtkAfesjsh8jJXkUUxnbbHk0oASaHcz0UOcpmqoaf47OoBDdOjV8Sl1oIW_qNJYLj9w7mNO8sOJBaifu-vMp0t81mWNGELCPy58-_iNmbZ-TNJ0Kx6aM3Yd7c98w2p4r5gxg6Q3cgqlBgFaUpAWPYd43Et_tWalKldYMWvFWidRQG6krg36VwPYDFGzuZB7lnnaiz_WsTSqBj55xjnHoTD2cHovsBT_Is2KzPKey0J-Na2Iegir-74swYKvbiHvstihc5OCqLXm9JU9mTG7xqbwaIcucwho3oonRD5lylmb7WzzRQkWVa7CWdR1NNVT8lpJ9hf2s6GDjA36z1x15eovg1i13KNVUSZncc2efYX5cQVBg8xjB1vuq2CxNOWuMfxawIWLue2rbe4dVBrxC9cknI7QuRghRSgIL1Ex-MGJzsEQeyQYogrZQ6om-ozkLnZFlDcFLy4NUtKvuxwoLOuDUZtZwOB8';
const alexaBaseUrl = 'https://api.amazonalexa.com';

locales.forEach((locale) => {

  let interactionModel = 
      JSON.parse(fs.readFileSync(`${filepath}/junran_debugg/models/${locale}.json`, 'utf8'));

  let updateInteractionModelOptions = {
    method: 'PUT',
    uri: alexaBaseUrl +
      `/v1/skills/${skillId}/stages/development/interactionModel/locales/${locale}`,
    headers: {
      'Authorization': accessToken,
    },
    body: JSON.stringify(interactionModel),
    //json: true,
    resolveWithFullResponse: true
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
});

// const { exec, execFile } = require('child_process');

// execFile('cd temp/junran_test', (err, stdout, stderr) => {
//   //console.log(stdout);
// });

// exec('ls', (err, stdout, stderr) => {
//   console.log(stdout);
// });

// let skillId = 'amzn1.ask.skill.2729813b-415b-4608-b0c8-10add1ac9b77';

// exec(`ask api update-model -s ${skillId} -f ./temp/junran_test/models/en-US.json -l en-US`, (err, stdout, stderr) => {
//   console.log('err: ', err);
//   console.log('stdout: ', stdout);
//   console.log('stderr: ', stderr);
// });