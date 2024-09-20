import { DataTypes } from 'sequelize';
import sequelize from '../configs/database.js';

// Define the FileInfo model
const FileInfo = sequelize.define('FileInfo', {
  fileName: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  publicKey: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  privateKey: {
    type: DataTypes.STRING,
    allowNull: false, 
  }
}, {
  tableName: 'file_info', 
  timestamps: true, 
});

export default FileInfo;
