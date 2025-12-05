const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kanban',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao MySQL');
    
    // Sincronizar modelos (criar tabelas se não existirem)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false }); // alter: true para atualizar schema
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error.message);
    console.log('\n📝 Para resolver:');
    console.log('1. Instale o MySQL: https://dev.mysql.com/downloads/mysql/');
    console.log('2. Ou use um serviço cloud como AWS RDS, PlanetScale, ou Railway');
    console.log('3. Configure as variáveis DB_* no arquivo .env\n');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
