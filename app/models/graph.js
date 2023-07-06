module.exports = (sequelize, Sequelize) => {
    const Graph = sequelize.define("graph", {
        source: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        destination: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        weight: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
         }
    });
    return Graph;
  };
