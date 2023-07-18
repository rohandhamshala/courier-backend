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
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        minimum_time: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        price_for_delivery_boy: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        distance: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        delivered_at: {
            type: Sequelize.DATE,
            allowNull: true,     
        },
        pickedup_at: {
            type: Sequelize.DATE,
            allowNull: true,     
        },
        delivered_in_time: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        delivery_boy_bonus: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
     timestamps: true, 
    }
    );
  
    return Order;
  };