module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("customer", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        last_name: {
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
        address: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        apartment_number: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false, 
    }
    );
    return Customer;
  };