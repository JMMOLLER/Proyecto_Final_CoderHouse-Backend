const yargs = require('yargs');
const ms = require('ms');

const conf = yargs(process.argv.slice(2)).alias({
    p: 'port',
    h: 'host',
    m: 'mode',
    e: 'expires',
}).default({
    p: 8080,
    h: 'localhost',
    m: 'debug',
    e: ms('30m')
}).argv;

module.exports = { conf };
