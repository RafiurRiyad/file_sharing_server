import { Sequelize } from 'sequelize';

// Configure Sequelize with your database credentials
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql', 
});

export default sequelize;
