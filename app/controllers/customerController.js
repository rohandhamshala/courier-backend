const db = require("../models");
const Customer = db.customer;
const Op = db.Sequelize.Op;

// Create and Save a new customer
exports.create = (req, res) => {
  // Validate request
  if (req.body.first_name === undefined) {
    const error = new Error("first_name cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  } 
  else if (req.body.last_name === undefined) {
    const error = new Error("last_name cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.email === undefined) {
    const error = new Error("email cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.mobile === undefined) {
    const error = new Error("mobile cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.address === undefined) {
    const error = new Error("address cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  }
  else if (req.body.apartment_number === undefined) {
    const error = new Error("apatment_number cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  }
  // Save customer in the database
  Customer.create(req.body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the customer.",
      });
    });
};

// Retrieve all categories from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id
    ? {
        id: {
          [Op.like]: `%${id}%`,
        },
      }
    : null;

  Customer.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving categories.",
      });
    });
};
// Find a single customer with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Customer.findByPk(id)
    .then((data) => {
        if (data) {
            res.json(data);
          } else {
            res.status(404).json({ error: 'customer not found' });
          }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving customer with id=" + id,
      });
    });
};

// Update a customer by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Customer.update(req.body, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "customer was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update customer with id=${id}. Maybe customer was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating customer with id=" + id,
      });
    });
};

// Delete a customer with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Customer.destroy({
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "customer was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete customer with id=${id}. Maybe customer was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete customer with id=" + id,
      });
    });
};

// Delete all categories from the database.
exports.deleteAll = (req, res) => {
  Customer.destroy({
    where: {},
    truncate: false,
  })
    .then((response) => {
      res.send({ message: `${response} categories were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all categories.",
      });
    });
};