const { sequelize } = require('../src/config/database');

const fixTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');

    // Verificar se a tabela existe e suas colunas
    const [results] = await sequelize.query("SHOW COLUMNS FROM project_invites");
    console.log('Colunas atuais:', results.map(r => r.Field));

    // Verificar se tem createdAt ou created_at
    const hasCreatedAt = results.some(r => r.Field === 'createdAt');
    const hasCreated_at = results.some(r => r.Field === 'created_at');

    if (hasCreatedAt && !hasCreated_at) {
      console.log('Corrigindo nomes das colunas para snake_case...');
      await sequelize.query(`
        ALTER TABLE project_invites 
        CHANGE COLUMN createdAt created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHANGE COLUMN updatedAt updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('Colunas corrigidas com sucesso!');
    } else if (hasCreated_at) {
      console.log('Tabela já está usando snake_case. Nada a fazer.');
    } else {
      console.log('Tabela não tem colunas de timestamp. Criando...');
      await sequelize.query(`
        ALTER TABLE project_invites 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('Colunas criadas com sucesso!');
    }

  } catch (error) {
    console.error('Erro:', error.message);
    if (error.message.includes('doesn\'t exist')) {
      console.log('Tabela não existe. Execute primeiro: npm run migrate:invites');
    }
  } finally {
    await sequelize.close();
  }
};

fixTable();

