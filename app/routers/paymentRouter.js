module.exports = (app) => {
    const Payment = require("../controllers/paymentController.js");
    var router = require("express").Router();
  
    // Create a new payment
    router.post("/payments/", Payment.create);
    // search payment
    router.get("/payments/search", Payment.search);

    // Get payments of a user
    router.get("/payments/users/:id", Payment.getPaymentsOfUser);

    router.get("/payments/creditedAmount/", Payment.getTotalCreditedAmount);

    // Get credited Amount of a user
    router.get("/payments/creditedAmount/:id", Payment.getCreditedAmountOfUser);

    // Retrieve all payment
    router.get("/payments/", Payment.findAll);

    // Retrieve a single payment with paymentId
    router.get("/payments/:id", Payment.findOne);
  
    // Update an payment with paymentId
    router.put("/payments/:id",  Payment.update);
  
    // Delete an payment with paymentId
    router.delete("/payments/:id", Payment.delete);
  
    // Delete all payments
    router.delete("/payments/", Payment.deleteAll);


  
    app.use(router);
  };
  