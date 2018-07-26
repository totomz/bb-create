const fs = require('fs');
const path = require('path');
const BBCreate = require('./BBCreate');
const program = require('commander');

program
    .arguments('<repo_definition_json>')
    .action(repoDefinition => {

        const home = require('os').homedir();
        const settings = path.join(home, '.bbcreate-settings.json');

        console.log(`Settings file: ${settings}`);
        console.log(`Repo definition: ${repoDefinition}`);

        let files = [];
        if (repoDefinition === 'all') {
            files = fs.readdirSync('./')
                .filter(file => file.endsWith('.json'))
                .filter(file => (file !== "package.json") && (file !== "package-lock.json"));
        }
        else {
            files = [repoDefinition];
        }

        const settingsFile = JSON.parse(fs.readFileSync(settings, 'UTF-8'));


        files.forEach(file => {
            console.log(`Updating ${file}`);

            new Promise((resolve, reject) => {
                return resolve(JSON.parse(fs.readFileSync(file, 'UTF-8')));
            })
            .then(repoJson => {
                return new BBCreate(
                    settingsFile,
                    repoJson
                ).setPipelineEnv()
            })
            .catch(err => {
                console.log(`FAILED ${file} - ${err.message}`);
            });


        })

    })
    .parse(process.argv);





