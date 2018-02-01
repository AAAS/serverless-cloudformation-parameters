'use strict';

const NO_UPDATE_MESSAGE = 'No updates are to be performed.';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.provider = this.serverless.getProvider('aws');

    this.hooks = {
      'aws:package:finalize:mergeCustomProviderResources': this.mergeCustomParameters.bind(this),
      'after:aws:deploy:deploy:updateStack': this.doesThisWork.bind(this),
    };
  }

  mergeCustomParameters() {
    this.serverless.cli.log("Adding Cloudformation Parameters...");

    let template = this.serverless.service.provider.compiledCloudFormationTemplate;

    if (this.serverless.service.custom.parameters) {
      template.Parameters = this.serverless.service.custom.parameters;
    }
  }

  doesThisWork() {
    // Copied from serverless/lib/plugins/aws/lib/updateStack.js
    this.serverless.cli.log("Does this work? idk");
    this.provider.getServerlessDeploymentBucketName()
      .then((bucketName) => {
        this.serverless.cli.log(bucketName);

        const compiledTemplateFileName = 'compiled-cloudformation-template.json';
        const templateUrl = `https://s3.amazonaws.com/${bucketName}/${this.serverless.service.package.artifactDirectoryName}/${compiledTemplateFileName}`;

        this.serverless.cli.log('Updating Stack...');
        const stackName = this.provider.naming.getStackName();
        let stackTags = { STAGE: this.provider.getStage() };

        // Merge additional stack tags
        if (typeof this.serverless.service.provider.stackTags === 'object') {
          stackTags = _.extend(stackTags, this.serverless.service.provider.stackTags);
        }

        const params = {
          StackName: stackName,
          Capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
          ],
          Parameters: [],
          TemplateURL: templateUrl,
          Tags: Object.keys(stackTags).map((key) => ({ Key: key, Value: stackTags[key] })),
        };

        if (this.serverless.service.provider.cfnRole) {
          params.RoleARN = this.serverless.service.provider.cfnRole;
        }

        params.Parameters = [
          {
            ParameterKey: "Foobar",
            ParameterValue: "foobarbaz",
            UsePreviousValue: false
          }
        ];

        this.serverless.cli.log(params);
        console.log(params);

        return this.provider.request('CloudFormation',
          'updateStack',
          params)
          .then((cfData) => this.monitorStack('update', cfData))
          .then(() => {console.log("ALL DONE")})
          .catch((e) => {
            if (e.message === NO_UPDATE_MESSAGE) {
              return;
            }
            throw e;
          });
      });
  }
}

module.exports = ServerlessPlugin;
