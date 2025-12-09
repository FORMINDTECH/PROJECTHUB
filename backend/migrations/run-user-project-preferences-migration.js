require('dotenv').config();
const createUserProjectPreferencesTable = require('./create-user-project-preferences');

async function runMigration() {
  try {
    console.log('🔄 Iniciando migration de user_project_preferences...');
    await createUserProjectPreferencesTable();
    console.log('✅ Migration concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migration:', error);
    process.exit(1);
  }
}

runMigration();


