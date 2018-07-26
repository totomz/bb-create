const fs = require('fs');
const path = require('path');
const BBCreate = require('./BBCreate');
const program = require('commander');

program
    .option('-r, --repo [json|all]', "A json configuration file. If 'all' is specified, update all the json in the current folder")
    .parse(process.argv);

const home = require('os').homedir();
const settings = path.join(home, '.bbcreate-settings.json');

let files = [];
if (program.repo === 'all') {
    files = fs.readdirSync('./')
        .filter(file => file.endsWith('.json'))
        .filter(file => (file !== "package.json") && (file !== "package-lock.json"));
}
else {
    files = [program.repo];
}

files.forEach(file => {
    console.log(`Updating ${file}`);

    new BBCreate(
        JSON.parse(fs.readFileSync(settings, 'UTF-8')),
        JSON.parse(fs.readFileSync(file, 'UTF-8'))
    ).setPipelineEnv()
})

