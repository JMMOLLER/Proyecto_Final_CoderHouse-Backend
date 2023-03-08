const yargs = require('yargs');
const conf = yargs(process.argv.slice(2)).alias({
    p: 'port',
    h: 'host',
    m: 'mode',
}).default({
    p: 8080,
    h: 'localhost',
    m: 'debug',
}).argv;

module.exports = { conf };
