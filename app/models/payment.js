module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("payment", {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        credited_amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        credited_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
     timestamps: true, 
    }   
    );
  
    return Payment;
  };