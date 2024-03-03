const { Client } = require('pg');

const postgresConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'note',
  password: '0539',
  port: '5432',
};

const postgresClient = new Client(postgresConfig);

async function createDatabaseConnection() {
  try {
    await postgresClient.connect();
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  }
}

module.exports = {
  postgresClient,
  createDatabaseConnection,
};