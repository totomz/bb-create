const fs = require('fs');
const path = require('path');
const BBCreate = require('./BBCreate');
const program = require('commander');
const home = require('os').homedir();
const settings = path.join(home, '.bbcreate-settings.json');

program
    .arguments('<repo_definition_json>')
    .action(repoDefinition => {

        console.log(`Settings file: ${settings}`);
        console.log(`Repo definition: ${repoDefinition}`);

        const bb = new BBCreate(
            JSON.parse(fs.readFileSync(settings, 'UTF-8')),
            JSON.parse(fs.readFileSync(repoDefinition, 'UTF-8'))
        );

        return bb
            .createRepo()
            .then(repo =>  bb.pushBranchMaster(repo) );
    })
    .parse(process.argv);





