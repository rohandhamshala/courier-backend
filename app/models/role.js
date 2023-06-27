module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("role", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
    type: Sequelize.STRING,
    allowNull: false,
    },
    },
    {
        timestamps: false, 
    }
    );
  
    return Role;
  };