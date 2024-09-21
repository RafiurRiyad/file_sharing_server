import { Sequelize } from 'sequelize';

// Initialize Sequelize instance
const sequelize = new Sequelize('file_server', 'root', 'root1234', {
  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;
