const db = require("../models");
const User = db.user;
const Session = db.session;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const { encrypt, getSalt, hashPassword } = require("../authentication/crypto");

// Create and Save a new User
exports.create = async (req, res) => {
  try {
    console.log("user",req.body)
    // Validate request
    if (req.body.firstName === undefined) {
      const error = new Error("First name cannot be empty for user!");
      error.statusCode = 400;
      throw error;
    } else if (req.body.lastName === undefined) {
      const error = new Error("Last name cannot be empty for user!");
      error.statusCode = 400;
      throw error;
    } else if (req.body.email === undefined) {
      const error = new Error("Email cannot be empty for user!");
      error.statusCode = 400;
      throw error;
    } else if (req.body.password === undefined) {
      const error = new Error("Password cannot be empty for user!");
      error.statusCode = 400;
      throw error;
    }
    else if (req.body.mobile === undefined) {
      const error = new Error("mobile cannot be empty for user!");
      error.statusCode = 400;
      throw error;
    }
    else if (req.body.role_id === undefined) {
      const error = new Error("role id cannot be empty for user!");
      error.statusCode = 400;
      throw error;
    }

    // find by email
    await User.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then(async (data) => {
        if (data) {
          res.status(500).send({
            message: "This email is already in use.",
          });
        } else {
          console.log("email not found");
          let salt = await getSalt();
          let hash = await hashPassword(req.body.password, salt);

          // Create a User
          const user = {
            id: req.body.id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            roleId: req.body.role_id,
            availabilty: 0,
            mobile: req.body.mobile,
            salt: salt,
          };

          // Save User in the database
          await User.create(user)
            .then(async (data) => {
              // Create a Session for the new user
              let userId = data.id;

              let expireTime = new Date();
              expireTime.setDate(expireTime.getDate() + 1);

              const session = {
                email: req.body.email,
                userId: userId,
                expirationDate: expireTime,
              };
              await Session.create(session).then(async (data) => {
                let sessionId = data.id;
                let token = await encrypt(sessionId);
                let userInfo = {
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  id: user.id,
                  token: token,
                  availabilty: user.availabilty,
                  role_id: user.roleId,
                  mobile: user.mobile
                };
                res.send(userInfo);
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the User.",
              });
            });
        }
      })
      .catch((err) => {
        return err.message || "Error retrieving User with email=" + email;
      });
    }
    catch(err) {
      res.status(500).send({
        message: err.message || "Error Creating User",
      });
    }
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id = ${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving User with id = " + id,
      });
    });
};

// Find a single User with an email
exports.findByEmail = (req, res) => {
  const email = req.params.email;

  User.findOne({
    where: {
      email: email,
    },
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.send({ email: "not found" });
        /*res.status(404).send({
          message: `Cannot find User with email=${email}.`
        });*/
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving User with email=" + email,
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id = ${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating User with id =" + id,
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id },
  })
    .then((number) => {
      if (number == 1) {
        res.send({
          message: "User was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete User with id = ${id}. Maybe User was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete User with id = " + id,
      });
    });
};

// Delete all People from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false,
  })
    .then((number) => {
      res.send({ message: `${number} People were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all people.",
      });
    });
};

exports.findAllAdmins = (req,res) => {

  const condition = {
    roleId: 1 // Condition to check if role equals 1 (admin)
  };

  User.findAll({ where: condition })
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving admins.",
    });
  });
}

exports.findAllClerks = (req,res) => {

  const condition = {
    roleId: 2 // Condition to check if role equals 2 (clerk)
  };

  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving clerks.",
      });
    });

}

exports.findAllDeliveryBoys = (req,res) => {
  const condition = {
    roleId: 3 // Condition to check if role equals 3 (delivery boy)
  };
  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving delivery boys.",
      });
    });

}

exports.findAllUnverified = (req,res) => {
  const condition = {  };
  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving unverifed users.",
      });
    });

}

exports.findAllAvailableDeliveryBoys = (req,res) => {
  const condition = {
    roleId: 3,
    availabilty: 1
  };
  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.findAllUnavailableDeliveryBoys = (req,res) => {
  const condition = {
    roleId: 3,
    availabilty: 0
  };
  User.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}