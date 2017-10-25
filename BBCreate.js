const merge = require('deepmerge');
const rp = require('request-promise');
const Promise = require("bluebird");

function BBCreate(settings, repoDef){
    this.settings = settings;
    this.repoDef = repoDef;
}

/**
 * This method CREATE THE REPO AND EVERYTHING ELSE (branch restrictions, pipelines env, notification).
 * Feel free to split this method in sub-functions
 * @param repoName {string} "team/repoName'
 */
BBCreate.prototype.createRepo = function() {

    const repoName = this.repoDef.repoName;
    const repoSettings = this.repoDef.repoSettings;
    const pipelineEnvs = this.repoDef.pipelineEnvs;
    const branchRestrictions = this.repoDef.branchRestrictions;

    const me = this;

    let newRepository;

    return this.buildRequest(`repositories/${repoName}`, {
        method: 'POST',
        body: repoSettings
    })
    /* Create the pipelines variables */
        .then(repo => {
            console.log(`Repo created - ${repo.uuid}. `);
            newRepository = repo;
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
        });
        // /* Create HipChat notifications */
        // .then(restrictions => {
        //     console.log(newRepository);
        //     return this.hipchatNotification(newRepository)
        // })
};

/**
 * Enable HipChat notifications
 * @param newRepository
 */
BBCreate.prototype.hipchatNotification = function(newRepository) {
    // return this.buildRequest('', {
    //     url: `https://hipbucket.bitbucketconnect.com/repositories/${newRepository.full_name}/rooms`,
    //     method: 'POST',
    //     // auth: {},
    //     headers: {
    //         'Authorization': 'HBSESSION xxx'
    //     },
    //     body:{
    //         repository: newRepository.full_name,
    //         repository_uuid: newRepository.uuid,
    //         room_id: this.repoDef.hipchatNotifications.room.id,
    //         active:true,
    //         notifications: this.repoDef.hipchatNotifications.notifications
    //     }
    // })
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


module.exports = BBCreate;