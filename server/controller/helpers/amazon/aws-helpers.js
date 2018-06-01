'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const exec = require('child_process').execSync;
const AlexaSkill = require('../../../models/alexa-skill-model');

const bucketName = 'skill-automation';

// AWS SETUP
const awsSetup = () => {
  return new Promise((resolve, reject) => {
    // SET AWS REGION
    AWS.config.update({
      region: 'us-east-1',
    });
    const credentials = new AWS.SharedIniFileCredentials({
      profile: 'default',
    });
    AWS.config.credentials = credentials;
    let sts = new AWS.STS({
      apiVersion: '2011-06-15',
    });
    // SET IAM ROLE
    let roleparams = {
      RoleArn: 'arn:aws:iam::429365556200:role/AlexaDeveloper',
      RoleSessionName: 'AlexaDeveloperRole1',
    };
    sts.assumeRole(roleparams, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        let creds = new AWS.Credentials(data.Credentials.AccessKeyId, data.Credentials.SecretAccessKey, data.Credentials.SessionToken);
        AWS.config.credentials = creds;
        resolve();
      }
    });
  });
};

// GET S3 BUCKETS
const awsS3listbuckets = () => {
  return new Promise((resolve, reject) => {
    let s3 = new AWS.S3();
    s3.listBuckets((err, data) => {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err);
      } else {
        console.log(data);           // successful response
        resolve(data);
      }
    });
  });
};

const addFileToS3 = async (skillDirectory, underscoreName) => {
  await awsSetup();

  if (!fs.existsSync(`${skillDirectory}/submission`)) {
    exec(`cd ${skillDirectory} && mkdir submission && zip -X -r submission/s3.zip * -x  index.zip > /dev/null`);
  } else {
    exec(`cd ${skillDirectory} && zip -X -r submission/s3.zip * -x index.zip > /dev/null`);
  }

  let file = `${skillDirectory}/submission/s3.zip`;
  let fileName = new Date(Date.now());
  let fileKey = fileName.toISOString() + '.zip';
  console.log('s3 file key: ', fileKey);

  // return new Promise((resolve, reject) => {
  //   fs.readFile(file, (err, data) => {
  //     if (err) {
  //       console.log('read file for s3 err');
  //       reject(err);
  //     }
  //     let s3 = new AWS.S3({
  //       apiVersion: '2006-03-01',
  //     });
  //     s3.putObject({
  //       Bucket: bucketName,
  //       Key: fileKey,
  //       Body: data,
  //     }, (err, data) => {
  //       if (err) {
  //         console.log('s3 put object err: ', err);
  //         reject(err);
  //       }
  //       console.log('s3 put object success: ', data);
  //       resolve(data);
  //     });
  //   });
  // });

  fs.readFile(file, (err, data) => {
    if (err) {
      console.log('read file for s3 err');
      throw err;
    }
    let s3 = new AWS.S3({
      apiVersion: '2006-03-01',
    });
    s3.putObject({
      Bucket: bucketName,
      Key: fileKey,
      Body: data,
    }, (err, data) => {
      if (err) console.log('s3 put object err: ', err);
      console.log('s3 put object success: ', data);

      AlexaSkill.findOne({name: underscoreName}, (err, data) => {
        if (err) console.log('db find one err: ', err);
        data.update({s3Key: fileKey}, (err, data) => {
          AlexaSkill.findOne({name: underscoreName}, (err, data) => {
            if (err) console.log('db find one err2: ', err);
            console.log('updated data: ', data);
          });
        });
      });
    });
  });
};

/**
 * DEPLOY ZIP FILE IN TEMP DIRECTORY TO AWS LAMBDA OR UPDATE AN EXISTING
 * FUNCTION
 */
const deployToAWSLambda = (skillDirectory, underscoreName) => {
  let lambda = new AWS.Lambda();

  return new Promise((resolve, reject) => {
    let checkParms = {
      FunctionName: underscoreName,
    };
    lambda.getFunction(checkParms, (err, data) => {
      let params;
      if (err) {
        // CREATE A NEW FUNCTION
        console.log(err, err.stack);

        params = {
          Code: {
            ZipFile: fs.readFileSync(`${skillDirectory}/project/submission/index.zip`),
          },
          FunctionName: underscoreName,
          Handler: 'index.handler',
          Role: 'arn:aws:iam::429365556200:role/lambda_dynamodb',
          Runtime: 'nodejs6.10',
        };

        lambda.createFunction(params, (err, data) => {
          if (err) {
            console.log(err, err.stack);
            reject(err);
          } else {
            console.log(data);
            addPermissionToLambda(lambda, underscoreName, resolve, reject);
          }
        });
      } else {
        // UPDATE EXISTING FUNCTION
        console.log(data);

        params = {
          FunctionName: underscoreName,
          ZipFile: fs.readFileSync(`${skillDirectory}/project/submission/index.zip`),
        };

        lambda.updateFunctionCode(params, (err, data) => {
          if (err) {
            console.log(err, err.stack);
            reject(err);
          } else {
            console.log('update lambda: ', data);
            resolve(data);
          }
        });
      }
    });
  });
};

function addPermissionToLambda(lambda, underscoreName, resolve, reject) {
  let permissionsParams = {
    Action: 'lambda:InvokeFunction', /* required */
    FunctionName: underscoreName, /* required */
    Principal: 'alexa-appkit.amazon.com', /* required */
    StatementId: '1234', /* required */
  };
  lambda.addPermission(permissionsParams, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      reject(err);
    } else {
      console.log('add permission: ', data);           // successful response
      resolve(data);
    }
  });
}

const deploy = (data, skillDirectory, underscoreName) => {
  console.log('deploying to AWS started...');

  return awsSetup()
    .then(() => {
      return deployToAWSLambda(skillDirectory, underscoreName);
    })
      .then((result) => {
        console.log('======================================================');
        console.log(result);
        return result;
      })
      .catch((err) => {
        console.log('lambda err: ', err.message);
        return err;
      });
};

// exports.awsSetup = awsSetup;
exports.awsS3listbuckets = awsS3listbuckets;
// exports.deployToAWSLambda = deployToAWSLambda;
exports.deploy = deploy;
exports.addFileToS3 = addFileToS3;
