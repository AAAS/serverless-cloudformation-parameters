# Serverless Cloudformation Parameters

Generates Cloudformation parameters for Serverless framework.

## Use Case

Serverless does not create parameters when it compiles Cloudformation templates. This allows for 
developers to create parameters that can be used for deployment.

## Installation

```
npm install serverless-cloudformation-parameters --save
sls plugin install -n serverless-cloudformation-parameters 
```

## Usage

serverless.yml
```
  service: example
  plugins:
    - serverless-cloudformation-parameters
  
  custom:
    parameters:
      SomeEnvVarPrefilled:
          Type: String
          Default: foo
          Description: A default parameter, filled with a value from your env when deployed with `sls deploy`
  
  provider:
    name: aws
    runtime: python2.7
    environment:
      # Use Ref to refer to parameter.
      bar:
        Ref: "SomeEnvVarPrefilled"
```