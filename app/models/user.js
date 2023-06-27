module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id:{
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    mobile: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
    salt: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
    availabilty: {
      type: Sequelize.INTEGER,
      allowNull: false,
    }
  },
  {
    timestamps: false, 
   }
  );

  return User;
};