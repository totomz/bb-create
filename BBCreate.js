const merge = require('deepmerge');
const rp = require('request-promise');
const Promise = require("bluebird");
const os = require('os');
const writer = require('fs-writefile-promise');
const rimraf = require('rimraf');

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
    const repoSettings = this.repoDef.repoDefinition;
    const pipelineEnvs = this.repoDef.pipelineEnvs;
    const branchRestrictions = this.repoDef.branchRestrictions;

    const me = this;

    let newRepository;

    return this.buildRequest(`repositories/${repoName}`, {
        method: 'POST',
        body: repoSettings
    })
    .then(repo => {
        console.log(`Repo created - ${repo.uuid}. `);
        newRepository = repo;
        return repo;
    })

    /* Enable pipelines */
    .then(repo => {
        console.log(`Enabling pipelines`);
        return this.buildRequest(`repositories/${repoName}/pipelines_config `, {
            method: 'PUT',
            body: { enabled: true }
        });
    })

    /* Create the pipelines variables */
    .then(repo => {

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

    /* Final stuff */
    .then(restrictions => {

        console.log(" ");
        console.log(" ");
        console.log(header);
        hyperLog("Wanna clone the repo?")
        newRepository.links.clone.forEach(link => {
            hyperLog(`git clone ${link.href}`)
        });
        hyperLog(" ");
        console.log("#".padEnd(hLength, "#"));

        return newRepository;
    })
    .then(whatever => {
        return newRepository;
    });
};

const header = "############################################ DONE ############################################";
const hLength = header.length - 1;
const hyperLog = function (message) {
    console.log(`# ${message}`.padEnd(hLength) + "#");
};

BBCreate.prototype.setPipelineEnv = function() {
    let requests = [];
    this.repoDef.pipelineEnvs.forEach(env => {
        console.log(`Setting env ${env.key}`);
        requests.push(this.buildRequest(`repositories/${this.repoDef.repoName}/pipelines_config/variables/`, {
            method: 'POST',
            body: env
        }).catch(err => {
            if (err.statusCode === 409 ) {
                console.log(`ENV ${env.key} already set - updating`)
                return this.buildRequest(`repositories/${this.repoDef.repoName}/pipelines_config/variables/`, {
                    method: 'PUT',
                    body: env
                })
            }
            else {
                throw err;
            }
        })
        )
    });

    return Promise.all(requests);
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


BBCreate.prototype.pushBranchMaster = function(newRepository, branchName = 'master'){

    /*
     Someone has done something wrong here....
     simple-git does not chain using Promises. It chain its own functions.
     AND we have rimraf, with its callback.
     Yep.
     */
    return new Promise((resolve, reject) => {

        const tmpPath = os.tmpdir();
        const repoSshLink = newRepository.links.clone.filter(link => {return link.name === 'ssh'})[0].href;
        const repoFullPath = `${tmpPath}/${newRepository.name}`;

        console.log(`Creating branch ${branchName}`);

        const simpleGit = require('simple-git')(tmpPath);
        simpleGit.clone(repoSshLink, (err, data) => {

            if(err){ return reject(err); }

            console.log(data);

            const git = require('simple-git')(repoFullPath);
            git
                .checkoutLocalBranch(branchName)
                .exec(() => {
                    writer(`${repoFullPath}/README.md`, `# ${newRepository.name} `)
                        .then(gitignore => {
                            git
                                .add(gitignore)
                                .commit(`Initial commit for branch ${branchName}`)
                                .push("origin", branchName)
                                .exec(() => {
                                    rimraf(repoFullPath, function () {
                                        resolve("LOL");
                                    });
                                })
                        })
                })

        })


    });


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