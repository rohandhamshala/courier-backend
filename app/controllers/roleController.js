const db = require("../models");
const Role = db.role;
const Op = db.Sequelize.Op;

// Create and Save a new role
exports.create = (req, res) => {
  // Validate request
  if (req.body.name === undefined) {
    const error = new Error("name cannot be empty for role!");
    error.statusCode = 400;
    throw error;
  }

  // Create a role
  const role = {
    name: req.body.name,
  };
  // Save role in the database
  Role.create(role)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the role.",
      });
    });
};

// Retrieve all roles from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id
    ? {
        id: {
          [Op.like]: `%${id}%`,
        },
      }
    : null;

  Role.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving roles.",
      });
    });
};

exports.search = (req, res) => {
  const search = req.query.search;
  var condition = search
  ? { name: { [Op.like]: `%${search}%` } }: null;
  
  Role.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving roles.",
      });
    });
};

// Find a single role with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Role.findByPk(id)
    .then((data) => {
        if (data) {
            res.json(data);
          } else {
            res.status(404).json({ error: 'role not found' });
          }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving role with id=" + id,
      });
    });
};

// Update a role by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Role.update(req.body, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "role was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update role with id=${id}. Maybe role was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating role with id=" + id,
      });
    });
};

// Delete a role with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Role.destroy({
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "role was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete role with id=${id}. Maybe role was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete role with id=" + id,
      });
    });
};

// Delete all roles from the database.
exports.deleteAll = (req, res) => {
  Role.destroy({
    where: {},
    truncate: false,
  })
    .then((response) => {
      res.send({ message: `${response} roles were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all roles.",
      });
    });
};