module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("order", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        pickup_time: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        price_for_order: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        minimum_time: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        price_for_delivery_boy: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        distance: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        delivered_at: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: '2023-09-09'
        }
    },
    {
     timestamps: true, 
    }
    );
  
    return Order;
  };