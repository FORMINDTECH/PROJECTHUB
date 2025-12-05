const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Criar conexão com o banco de dados
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kanban_db',
      multipleStatements: true
    });

    console.log('✅ Conectado ao banco de dados');

    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'add_nickname_and_project_members.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Executando migração...');

    // Executar a migração
    await connection.query(sql);

    console.log('✅ Migração executada com sucesso!');
    console.log('   - Coluna "nickname" adicionada na tabela "users"');
    console.log('   - Tabela "project_members" criada');

  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  A coluna "nickname" já existe. Pulando...');
    } else if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('⚠️  A tabela "project_members" já existe. Pulando...');
    } else {
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

runMigration();

