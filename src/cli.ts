#!/usr/bin/env node
import {Command} from "commander";
import {translate} from "./main";

const program = new Command();

program
    .version('0.0.1')
    .name('translate')
    .usage('<English>')
    .arguments('<English>')
    .action((English) => {
        translate(English)
    });

program.parse(process.argv);