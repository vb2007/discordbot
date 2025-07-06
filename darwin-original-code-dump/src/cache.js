const Database = require('better-sqlite3');
const db = new Database('cache.db');

db.exec('CREATE TABLE IF NOT EXISTS cache (value TEXT)');

const stmt_add = db.prepare('INSERT INTO cache (value) VALUES (?)');
const stmt_have = db.prepare('SELECT value FROM cache WHERE value = ?');

function add(string) {
    console.log(`Adding "${string}"`);
    stmt_add.run(string);
}

function have(string) {
    console.log(`Checking "${string}"`);
    const row = stmt_have.get(string);
    return row ? true : false;
}

module.exports = {
    add,
    have
}