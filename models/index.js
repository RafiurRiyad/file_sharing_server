import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize'; 

const basename = path.basename(__filename);
const models = {};

// Read all files in the models directory (excluding index.js) and import them as Sequelize models
fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file)).default(sequelize, Sequelize.DataTypes);
    models[model.name] = model;
  });

// If you have model associations, they can be set up here
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;

export default models;
