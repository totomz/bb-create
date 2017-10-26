const fs = require('fs');
const path = require('path');
const BBCreate = require('../../BBCreate');
const Fixtures = require('./Fixtures');


const settings = path.join(process.env.HOME, '.bbcreate-settings.json');
const repoOpt = path.resolve('./example-repo.json'); // path.resolve(process.argv.pop());


describe('Test repository creation', function() {

    it('Create a default branch', function(){
        this.timeout(50000);
        const branchName = `test_branch_${parseInt(Math.random() * 1000000)}`;
        return new BBCreate(JSON.parse(fs.readFileSync(settings, 'UTF-8')), JSON.parse(fs.readFileSync(repoOpt, 'UTF-8')) )
            .pushBranchMaster(Fixtures.createRepoResult, branchName);
    });
});