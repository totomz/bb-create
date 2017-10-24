#! /usr/bin/env node

const merge = require('deepmerge');
const rp = require('request-promise');
const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');



function BBCreate(settings, repoDef){
    this.settings = settings;
    this.repoDef = repoDef;
}

/**
 *
 * @param repoName {string} "team/repoName'
 */
BBCreate.prototype.createRepo = function() {

    const repoName = this.repoDef.repoName;
    const repoSettings = this.repoDef.repoSettings;
    const pipelineEnvs = this.repoDef.pipelineEnvs;
    const branchRestrictions = this.repoDef.branchRestrictions;
    const me = this;

    return this.buildRequest(`repositories/${repoName}`, {
        method: 'POST',
        body: repoSettings
    })
    /* Create the pipelines variables */
    .then(repo => {
        console.log(`Repo created - ${repo.uuid}. `)
        let requests = [];
        pipelineEnvs.forEach(env => {
            console.log(`Creating env ${env.key}`);
            requests.push(this.buildRequest(`repositories/${repoName}/pipelines_config/variables/`, {
                method: 'POST',
                body: env
            }))
        });

        return Promise.all(requests);
    })
    /* Create the branch restirctions */
    .then(envs => {
        let requests = [];
        branchRestrictions.forEach(restriction => {
            console.log(`Creating restriction ${restriction.kind}`);
            requests.push(this.buildRequest(`repositories/${repoName}/branch-restrictions`, {
                method: 'POST',
                body: restriction
            }))
        });

        return Promise.all(requests);
    })
};

BBCreate.prototype.buildRequest = function(path, options){
    const params = merge({
        url: `https://api.bitbucket.org/2.0/${path}`,
        json:true,
        auth: {
            'user': this.settings.username,
            'pass': this.settings.appPassword,
            'sendImmediately': true
        }
    }, (options || {}));

    return rp(params);
};

const home = process.env.HOME || process.env.USERPROFILE;
const settings = path.join(home, '.bbcreate-settings.json');
const repoOpt = path.resolve(process.argv.pop());

console.log(`Reading settings from ${settings}`);
console.log(`Reading repo definition from ${repoOpt}`);

new BBCreate(
    JSON.parse(fs.readFileSync(settings, 'UTF-8')),
    JSON.parse(fs.readFileSync(repoOpt, 'UTF-8'))
)
.createRepo()
.then(repo => { console.log("DONE"); })
.catch(err => { console.log("ERROR!", err); });