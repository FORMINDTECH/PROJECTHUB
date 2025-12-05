const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runAvatarMigration() {
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
    const sqlFile = path.join(__dirname, 'add_avatar_column.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Executando migração para adicionar coluna avatar...');

    // Executar a migração
    await connection.query(sql);

    console.log('✅ Migração executada com sucesso!');
    console.log('   - Coluna "avatar" adicionada na tabela "users"');

  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

runAvatarMigration();

