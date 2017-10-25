
There are no tests here! Use this at your own risk!

# Readme

A tiny script to create `Bitbucket` repositories using a configuration file, instead of relying on manual configuration 

Supported settings:
* Creation of the repo with its metadata (name, description, private/public, etc.)
* Enable pipeline and set environment variables
* Branch restrictions (number of review, number of passing builds)


Missing features
* Create HipChat notifications
* Test

# How to use

Install this module `npm install -g bb-create`

Get an [App Password](https://confluence.atlassian.com/bitbucket/app-passwords-828781300.html) and write a `~/.bbcreate-settings.json` config file
```
{
    "username": <YOUR_USER_NAME>,
    "appPassword": <YES_EXACTLY_WHAT_HE_SAYS> 
}
```

Then write the definition of your Bitbucket repo in a JSON file. 

Last step, run `bb-create <REPO_DEFINITION>.json`


## How to define a Bitbucket repository
See `example-repo.json` and refer to the Atlassian documentaiton 
 * [Repository](https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D)
 * [Pipeline configuration](https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/pipelines_config)
 * [BRanch restrictions](https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/branch-restrictions)