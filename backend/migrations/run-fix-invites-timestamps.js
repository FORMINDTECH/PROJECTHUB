const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

const migrationFileName = 'fix_invites_timestamps.sql';
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
    if (error.message.includes('Unknown column') || error.message.includes('doesn\'t exist')) {
      console.warn(`A coluna pode não existir ou já estar correta. Ignorando erro para ${migrationFileName}.`);
    } else {
      process.exit(1);
    }
  } finally {
    await sequelize.close();
  }
};

runMigration();

