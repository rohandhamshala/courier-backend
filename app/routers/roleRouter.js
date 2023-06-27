module.exports = (app) => {
    const Role = require("../controllers/roleController.js");
    var router = require("express").Router();
  
    // Create a new role
    router.post("/roles/", Role.create);

    // search role
    router.get("/roles/search", Role.search);
  
    // Retrieve all role
    router.get("/roles/", Role.findAll);

    // Retrieve a single role with roleId
    router.get("/roles/:id", Role.findOne);
  
    // Update an role with roleId
    router.put("/roles/:id",  Role.update);
  
    // Delete an role with roleId
    router.delete("/roles/:id", Role.delete);
  
    // Delete all roles
    router.delete("/roles/", Role.deleteAll);
  
    app.use(router);
  };
  