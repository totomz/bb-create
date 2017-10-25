#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const BBCreate = require('./BBCreate');

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
.catch(err => {
    console.log("ERROR!");
    console.log(err.message);
});
