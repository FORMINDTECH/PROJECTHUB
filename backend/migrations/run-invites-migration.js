const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

const migrationFileName = 'create_project_invites.sql';
const migrationFilePath = path.join(__dirname, migrationFileName);

const runMigration = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');

    const sql = fs.readFileSync(migrationFilePath, 'utf8');
    await sequelize.query(sql);
    console.log(`Migration executada com sucesso: ${migrationFileName}`);

  } catch (error) {
    console.error(`Erro ao executar migration ${migrationFileName}:`, error.message);
    if (error.message.includes('ER_TABLE_EXISTS_ERROR') || error.message.includes('already exists')) {
      console.warn(`A tabela já existe. Ignorando erro para ${migrationFileName}.`);
    } else {
      process.exit(1);
    }
  } finally {
    await sequelize.close();
  }
};

runMigration();

