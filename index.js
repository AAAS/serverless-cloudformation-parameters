'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.provider = this.serverless.getProvider('aws');

    this.hooks = {
      'aws:package:finalize:mergeCustomProviderResources': this.mergeCustomParameters.bind(this)
    };
  }

  mergeCustomParameters() {
    this.serverless.cli.log("Adding Cloudformation Parameters...");

    let template = this.serverless.service.provider.compiledCloudFormationTemplate;

    if (this.serverless.service.custom.parameters) {
      template.Parameters = this.serverless.service.custom.parameters;
    }
  }
}

module.exports = ServerlessPlugin;
