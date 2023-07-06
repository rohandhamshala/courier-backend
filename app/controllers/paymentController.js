const db = require("../models");
const Payment = db.payment;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const User = db.user;

// Create and Save a new payment
exports.create = (req, res) => {
  // Validate request
  if (req.body.userId === undefined) {
    const error = new Error("userId cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  } 
  else if (req.body.credited_amount === undefined) {
    const error = new Error("credited_amount cannot be empty for customer!");
    error.statusCode = 400;
    throw error;
  }

  // Save payment in the database
  Payment.create({...req.body, credited_date: new Date()})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the payment.",
      });
    });
};

// Retrieve all payments from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id
    ? {
        id: {
          [Op.like]: `%${id}%`,
        },
      }
    : null;

  Payment.findAll({ where: condition, include: [{ model: User, as: 'user' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving payments.",
      });
    });
};

exports.search = (req, res) => {
  const search = req.query.search;
  var condition = search
  ? {
      [Op.or]: [
        { description: { [Op.like]: `%${search}%` } },
        { credited_date: { [Op.like]: `%${search}%` } },
      ],
    }
  : null;
  
  Payment.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving payments.",
      });
    });
};

// Find a single payment with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Payment.findByPk(id)
    .then((data) => {
        if (data) {
            res.json(data);
          } else {
            res.status(404).json({ error: 'payment not found' });
          }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving payment with id=" + id,
      });
    });
};

// Update a payment by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Payment.update(req.body, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "payment was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update payment with id=${id}. Maybe payment was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating payment with id=" + id,
      });
    });
};

// Delete a payment with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Payment.destroy({
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "payment was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete payment with id=${id}. Maybe payment was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete payment with id=" + id,
      });
    });
};

// Delete all payments from the database.
exports.deleteAll = (req, res) => {
  Payment.destroy({
    where: {},
    truncate: false,
  })
    .then((response) => {
      res.send({ message: `${response} payments were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all payments.",
      });
    });
};

exports.getPaymentsOfUser = (req,res) => {
  const id = req.params.id;
  const condition = {
    userId: id
  };
  Payment.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving payments.",
      });
    });
}

exports.getCreditedAmountOfUser = (req, res) => {
  const id = req.params.id;
  const condition = {
    userId: id
  };

  Payment.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('credited_amount')), 'total_credited_amount']
    ],
    where: condition
  })
    .then((data) => {
      const totalCreditedAmount = data[0].dataValues.total_credited_amount;
      res.send({ total_credited_amount: totalCreditedAmount });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving credited amount of a user.",
      });
    });
};

exports.getTotalCreditedAmount = (req, res) => {

  Payment.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('credited_amount')), 'total_credited_amount']
    ]
  })
    .then((data) => {
      const totalCreditedAmount = data[0].dataValues.total_credited_amount;
      res.send({ total_credited_amount: totalCreditedAmount });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving total credited amount.",
      });
    });
};