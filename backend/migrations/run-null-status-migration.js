const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kanban_db',
      multipleStatements: true
    });

    console.log('Conectado ao banco de dados');

    const sqlFile = path.join(__dirname, 'allow_null_status.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executando migration: allow_null_status.sql');
    await connection.query(sql);
    
    console.log('Migration executada com sucesso!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('Migration já foi executada anteriormente ou coluna já existe.');
    } else {
      console.error('Erro ao executar migration:', error.message);
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();

