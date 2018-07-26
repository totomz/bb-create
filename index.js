#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const BBCreate = require('./BBCreate');

const home = process.env.HOME || process.env.USERPROFILE;
const settings = path.join(home, '.bbcreate-settings.json');

const program = require('commander');

program
    .version('0.1.6')
    .command('update', 'Update repos to match their settings (only ENV variable)')
    .command('create', 'Create a repo using a given configuration file')
    .parse(process.argv);


