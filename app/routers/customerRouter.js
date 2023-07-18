module.exports = (app) => {
  const Customer = require("../controllers/customerController.js");
  var router = require("express").Router();

  // Create a new Customer
  router.post("/customers/", Customer.create);

  // Retrieve all Customer
  router.get("/customers/", Customer.findAll);
  // Retrieve a single Customer with CustomerId
  router.get("/customers/:id", Customer.findOne);

  // Update an Customer with CustomerId
  router.put("/customers/:id",  Customer.update);

  // Delete an Customer with CustomerId
  router.delete("/customers/:id", Customer.delete);

  // Delete all customers
  router.delete("/customers/", Customer.deleteAll);

  app.use(router);
};
