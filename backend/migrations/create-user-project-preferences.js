const { sequelize } = require('../src/config/database');

async function createUserProjectPreferencesTable() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_project_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        project_id INT NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
        \`order\` INT DEFAULT 0 NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_project (user_id, project_id),
        INDEX idx_user_id (user_id),
        INDEX idx_project_id (project_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela user_project_preferences criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabela user_project_preferences:', error);
    throw error;
  }
}

module.exports = createUserProjectPreferencesTable;


