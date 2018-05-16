'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

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
            // resolve(data);

            // let permissionsParams = {
            //   Action: 'lambda:InvokeFunction', /* required */
            //   FunctionName: underscoreName, /* required */
            //   Principal: 'alexa-appkit.amazon.com', /* required */
            //   StatementId: '1234', /* required */
            // };
            // lambda.addPermission(permissionsParams, function(err, data) {
            //   if (err) {
            //     console.log(err, err.stack); // an error occurred
            //     reject(err);
            //   } else {
            //     console.log('add permission: ', data);           // successful response
            //     resolve(data);
            //   }
            // });
            addPermissionToLambda(lambda, underscoreName, resolve, reject);
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
// exports.awsS3listbuckets = awsS3listbuckets;
// exports.deployToAWSLambda = deployToAWSLambda;
exports.deploy = deploy;
