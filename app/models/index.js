const dbConfig = require("../config/database.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.session = require("./session.js")(sequelize, Sequelize);
db.user = require("./user.js")(sequelize, Sequelize);
db.customer = require("./customer.js")(sequelize, Sequelize);
db.payment = require("./payment.js")(sequelize, Sequelize);
db.order = require("./order.js")(sequelize, Sequelize);
db.role = require("./role.js")(sequelize, Sequelize);
db.graph = require("./graph.js")(sequelize, Sequelize);

// foreign key for session
db.user.hasMany(
  db.session,
  { as: "session" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.session.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

// foreign key for user
db.role.hasMany(
  db.user,
  { as: "role" },
  { foreignKey: { 
    allowNull: false,
    name: "roleId"
   } }
);

// foreign key for payment
db.user.hasMany(
  db.payment,
  { as: "payment" },
  { foreignKey: { 
    allowNull: false,
    name: "userId"
   } }
);
db.payment.belongsTo(db.user, {
  foreignKey: 'userId' // Foreign key in the Payment model referencing the User model
});

//foreign key for orders

db.user.hasMany(db.order, {
  as: "order1",
  foreignKey: {
    name: "user_id", 
    allowNull: false,
  },
});

db.user.hasMany(db.order, {
  as: "order2",
  foreignKey: {
    name: "delivery_boy_id", 
    allowNull: true,
  },
});

db.customer.hasMany(db.order, {
  as: "order3",
  foreignKey: {
    name: "pickup_customer_id", 
    allowNull: true,
  },
});
db.customer.hasMany(db.order, {
  as: "order4",
  foreignKey: {
    name: "delivery_customer_id", 
    allowNull: true,
  },
});
db.order.belongsTo(db.customer, {
  foreignKey: 'pickup_customer_id', // Foreign key in the Payment model referencing the User model
  as: 'pickup_customer'
});
db.order.belongsTo(db.customer, {
  foreignKey: 'delivery_customer_id', // Foreign key in the Payment model referencing the User model
  as: 'delivery_customer'
});

db.order.belongsTo(db.user, {
  foreignKey: 'delivery_boy_id', // Foreign key in the Payment model referencing the User model
  as: 'delivery_boy_details'
});
db.order.belongsTo(db.user, {
  foreignKey: 'user_id', // Foreign key in the Payment model referencing the User model
  as: 'clerk_details'
});
module.exports = db;
