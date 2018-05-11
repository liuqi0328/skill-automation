'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

const awsSetup = () => {
  return new Promise((resolve, reject) => {
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
    let roleparams = {
      RoleArn: 'arn:aws:iam::429365556200:role/AlexaDeveloper',
      RoleSessionName: 'AlexaDeveloperRole1',
    };
    sts.assumeRole(roleparams, function(err, data) {
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

const awsS3listbuckets = () => {
  return new Promise((resolve, reject) => {
    let s3 = new AWS.S3();
    s3.listBuckets(function(err, data) {
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

const deployToAWSLambda = (skillDirectory, underscoreName) => {
  let lambda = new AWS.Lambda();

  return new Promise((resolve, reject) => {
    let checkParms = {
      FunctionName: underscoreName,
    };
    lambda.getFunction(checkParms, function(err, data) {
      let params;
      if (err) {
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

        lambda.createFunction(params, function(err, data) {
            if (err) {
              console.log(err, err.stack);
              reject(err);
            } else {
              console.log(data);
              resolve(data);
            }
        });
      } else {
        console.log(data);

        params = {
          FunctionName: underscoreName,
          ZipFile: fs.readFileSync(`${skillDirectory}/project/submission/index.zip`),
        };

        lambda.updateFunctionCode(params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
            reject(err);
          } else {
            console.log(data);
            resolve(data);
          }
        });
      }
    });
  });
};

exports.awsSetup = awsSetup;
exports.awsS3listbuckets = awsS3listbuckets;
exports.deployToAWSLambda = deployToAWSLambda;
