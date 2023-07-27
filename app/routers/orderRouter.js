module.exports = (app) => {
  const Order = require("../controllers/orderController.js");
  var router = require("express").Router();

  // Create a new order
  router.post("/orders/", Order.create);
  router.post("/orders/calculate", Order.calculate);
  router.post("/orders/route", Order.findRoute);

  // search order
  router.get("/orders/search", Order.search);
  router.get("/orders/pending", Order.getPendingOrders);
  router.get("/orders/progress", Order.getProgressOrders);
  router.get("/orders/delivered", Order.getDeliveredOrders);
  router.get("/orders/deliveryBoy/:id", Order.getOrdersDeliveryByUser);
  router.get("/orders/deliveredToCustomer/:id", Order.getOrdersDeliveryToCustomer);
  router.get("/orders/sentByCustomer/:id", Order.getOrdersSentByCustomer);
  router.get("/orders/placedBy/:id", Order.getOrdersPlacedByClerk);
  router.get("/orders/presentWeek",Order.getPresentWeekOrders);
  router.post("/orders/pickedup/:id", Order.pickedup);
  router.post("/orders/delivered/:id", Order.delivered);

  // Retrieve all order
  router.get("/orders/", Order.findAll);

  // Retrieve a single order with orderId
  router.get("/orders/:id", Order.findOne);

  // Update an order with orderId
  router.put("/orders/:id",  Order.update);

  // Delete an order with orderId
  router.delete("/orders/:id", Order.delete);

  // Delete all orders
  router.delete("/orders/", Order.deleteAll);

  app.use(router);
};
