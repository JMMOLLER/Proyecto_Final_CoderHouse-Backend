const yargs = require('yargs');
const conf = yargs(process.argv.slice(2)).alias({
    p: 'port',
    h: 'host',
}).default({
    p: 8080,
    h: 'localhost',
}).argv;

module.exports = { conf };
