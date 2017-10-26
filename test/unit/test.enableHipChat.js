const fs = require('fs');
const path = require('path');
const BBCreate = require('../../BBCreate');
const Fixtures = require('./Fixtures');


const settings = path.join(process.env.HOME, '.bbcreate-settings.json');
const repoOpt = path.resolve('./example-repo.json'); // path.resolve(process.argv.pop());


describe('Test HipChat integration', function() {

    it('Fake test', function(done) {
        done();
    });

    // it('Create HipChat notifications', function() {
    //
    //
    //     console.log(`Reading settings from ${settings}`);
    //     console.log(`Reading repo definition from ${repoOpt}`);
    //
    //     return new BBCreate(JSON.parse(fs.readFileSync(settings, 'UTF-8')), JSON.parse(fs.readFileSync(repoOpt, 'UTF-8')) )
    //         .hipchatNotification(Fixtures.createRepoResult)
    //         .then(result => {
    //             console.log("Stai perdendo tempo? No, non credo. Ma dovresti scriverci un articolo su sta cosa");
    //             console.log(result);
    //         });
    //
    // });

    it('Push master branch', function(){
        console.log("Lol");
        this.timeout(50000);
        return new BBCreate(JSON.parse(fs.readFileSync(settings, 'UTF-8')), JSON.parse(fs.readFileSync(repoOpt, 'UTF-8')) )
            .pushBranchMaster(Fixtures.createRepoResult);


    });

});