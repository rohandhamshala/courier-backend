const db = require("../models");
const Order = db.order;
const Customer = db.customer;
const Graph = db.graph;
const Op = db.Sequelize.Op;
const User = db.user;
const Sequelize = db.Sequelize;
const moment = require('moment');
const { checkDeliveredInTime, sendOrderConfirmationEmail,sendOrderDeliveredEmail,sendOrderPickedupEmail } = require("../utils")


// Create and Save a new order
exports.create = (req, res) => {
  // Validate request
  if (req.body.pickup_time === undefined) {
    const error = new Error("pickup_time cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.pickup_customer_id === undefined) {
    const error = new Error("pickup_customer_id cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.delivery_customer_id === undefined) {
    const error = new Error("delivery_customer_id cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.price_for_order === undefined) {
    const error = new Error("price_for_order cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.distance === undefined) {
    const error = new Error("distance cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.minimum_time === undefined) {
    const error = new Error("time cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  } 

  req.body.price_for_delivery_boy = req.body.price_for_order * 0.15
  req.body.status = "PENDING"
 
  // Save order in the database
  Order.create(req.body)
    .then((data) => {
      res.send(data);
      sendOrderConfirmationEmail(data)
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the order.",
      });
    });
};

exports.calculate = async(req, res) => {
  try{
  // Validate request
 if (req.body.pickup_address === undefined) {
    const error = new Error("pickup_customer_id cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  } else if (req.body.delivery_address === undefined) {
    const error = new Error("delivery_customer_id cannot be empty for order!");
    error.statusCode = 400;
    throw error;
  }
  const shortestDistance = await findPath(req.body.pickup_address,req.body.delivery_address)
  // Do Calculations
  if(shortestDistance) {
    res.send({
      price_for_order: shortestDistance * 1.5,
      minimum_time: shortestDistance * 3,
      distance: shortestDistance
    });
  }
  else {
    res.status(500).send({
      message: "Error in calculating the distance",
    });
  }
}
catch(e){
  res.status(500).send({
    message: "Error in calculating the distance",
  });
}
};

exports.findRoute = async(req,res) => {
  try {
    // Validate request
    if (req.body.pickup_address === undefined) {
      const error = new Error("pickup_customer_id cannot be empty for order!");
      error.statusCode = 400;
      throw error;
    } else if (req.body.delivery_address === undefined) {
      const error = new Error("delivery_customer_id cannot be empty for order!");
      error.statusCode = 400;
      throw error;
    }
    const dist = await findShortestPath(req.body.pickup_address,req.body.delivery_address);
    if(dist){
      const officeToSource = await findRoute("3C",req.body.pickup_address);
      const sourceToDestination = await findRoute(req.body.pickup_address,req.body.delivery_address);
      const destinationToOffice = await findRoute(req.body.delivery_address,"3C");
  
      res.send({
        officeToSource,
        sourceToDestination,
        destinationToOffice
      })
    } else {
      res.status(500).send({
        message: "Error in finding path",
      })
    }
   
  }
  catch(e) {
    res.status(500).send({
      message: "Error in finding path",
    });
  }
  
}

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

  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders.",
      });
    });
};

exports.search = (req, res) => {
  const key = req.query.key;
  var condition = key
  ? { id: { [Op.like]: `%${key}%` } }: null;
  
  Order.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders.",
      });
    });
};

// Find a single order with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Order.findByPk(id,{ include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' },{ model: User, as: 'clerk_details' }] })
    .then((data) => {
        if (data) {
            res.json(data);
          } else {
            res.status(404).json({ error: 'order not found' });
          }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving order with id=" + id,
      });
    });
};

// Update a order by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Order.update(req.body, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update order with id=${id}. Maybe order was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating order with id=" + id,
      });
    });
};

exports.pickedup  = async(req, res) => {
  try{
  const id = req.params.id;
  const order = await Order.findByPk(id)
  Order.update({pickedup_at: Sequelize.literal('CURRENT_TIMESTAMP'),status:"PROGRESS"}, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was updated successfully.",
        });
        sendOrderPickedupEmail(order)
      } else {
        res.send({
          message: `Cannot update order with id=${id}. Maybe order was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating order with id=" + id,
      });
    });
  }
  catch(e) {
    res.status(500).send({
      message: e.message || "Error updating order with id=" + id,
    });
  }
};

exports.delivered  = async(req, res) => {
  try {
  const id = req.params.id;
  const order  = await Order.findByPk(id)
  const current_time = new Date();
  const deliveredInTime = checkDeliveredInTime(order.pickedup_at,current_time,order.minimum_time)
  Order.update({ delivered_at: Sequelize.literal('CURRENT_TIMESTAMP'),status:"DELIVERED",delivered_in_time: deliveredInTime ? "YES" : "NO", delivery_boy_bonus: deliveredInTime ? order.price_for_order*0.1 : 0 }, {
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was updated successfully.",
        });
        sendOrderDeliveredEmail(order)
      } else {
        res.send({
          message: `Cannot update order with id=${id}. Maybe order was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating order with id=" + id,
      });
    });
  }
  catch(e) {
    res.status(500).send({
      message: e.message || "Error updating order with id=" + id,
    });
  }
};

// Delete a order with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Order.destroy({
    where: { id: id },
  })
    .then((response) => {
      if (response == 1) {
        res.send({
          message: "order was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete order with id=${id}. Maybe order was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete order with id=" + id,
      });
    });
};

// Delete all categories from the database.
exports.deleteAll = (req, res) => {
  Order.destroy({
    where: {},
    truncate: false,
  })
    .then((response) => {
      res.send({ message: `${response} categories were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all orders.",
      });
    });
};

exports.getOrdersDeliveryByUser = (req,res) => {
  const id = req.params.id;
  const status = req.query.status;
  const condition = {
    delivery_boy_id: id,
  };
  if(status && status == "DELIVERED") {
    condition.status = status
  } else if(status && status == "NOT_DELIVERED") {
    condition.status = { [Op.in]: ["PENDING", "PROGRESS"] };
  } else if(status) {
    condition.status = status
  }
  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}
exports.getOrdersDeliveryToCustomer = (req,res) => {
  const id = req.params.id;
  const condition = {
    delivery_customer_id: id,
  };
  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}
exports.getOrdersSentByCustomer = (req,res) => {
  const id = req.params.id;
  const condition = {
    pickup_customer_id: id,
  };
  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}
exports.getOrdersPlacedByClerk = (req,res) => {
  const id = req.params.id;
  const condition = {
    user_id: id,
  };
  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.getPendingOrders = (req,res) => {
  const condition = {
    status: "PENDING",
  };
  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.getProgressOrders = (req,res) => {
  const condition = {
    status: "PROGRESS",
  };
  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}

exports.getDeliveredOrders = (req,res) => {
  const condition = {
    status: "DELIVERED",
  };
  Order.findAll({ where: condition, include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' }] })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving available delivery boys.",
      });
    });
}
exports.getPresentWeekOrders = (req, res) => {
  const startOfWeek = moment().startOf('week').format('YYYY-MM-DD'); // Get the start of the current week
  const endOfWeek = moment().endOf('week').format('YYYY-MM-DD'); // Get the end of the current week

  const condition = {
    pickup_time: {
      [Op.between]: [startOfWeek, endOfWeek]
    }
  };
  Order.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving present week orders.",
      });
    });
};

async function findPath(source,destination) {
  const pickupDistance = await findShortestPath('3C',source);
  const deliveryDistance = await findShortestPath(source,destination);
  const returnToOfc = await findShortestPath(destination,'3C');
  return pickupDistance+deliveryDistance+returnToOfc;
}

// Function to find the shortest path using Dijkstra's algorithm
async function findShortestPath(source, destination) {

  // Retrieve all data from the Graph table
  const allGraphData = await Graph.findAll();

  // Form the graph using the retrieved data
  const graph = {};
  allGraphData.forEach((entry) => {
    const { source, destination, weight } = entry;
    if (!graph[source]) {
      graph[source] = {};
    }
    graph[source][destination] = weight;
  });

  // Initialize distance and visited arrays
  const distances = {};
  const visited = {};

  // Initialize distances with Infinity and set source distance to 0
  Object.keys(graph).forEach((vertex) => {
    distances[vertex] = Infinity;
  });
  distances[source] = 0;

  while (true) {
    let closestVertex = null;
    let closestDistance = Infinity;

    // Find the closest unvisited vertex
    Object.keys(graph).forEach((vertex) => {
      if (!visited[vertex] && distances[vertex] < closestDistance) {
        closestVertex = vertex;
        closestDistance = distances[vertex];
      }
    });

    if (closestVertex === null) {
      break; // No reachable vertices left
    }

    // Mark the closest vertex as visited
    visited[closestVertex] = true;

    // Update distances to its neighbors
    Object.keys(graph[closestVertex]).forEach((neighbor) => {
      const distance = closestDistance + graph[closestVertex][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
      }
    });
  }

  // Return the shortest distance to the destination
  return distances[destination];
}


// Function to find the shortest path using Dijkstra's algorithm
async function findRoute(source, destination) {
  // Retrieve all data from the Graph table
  const allGraphData = await Graph.findAll();

  // Form the graph using the retrieved data
  const graph = {};
  allGraphData.forEach((entry) => {
    const { source, destination, weight } = entry;
    if (!graph[source]) {
      graph[source] = {};
    }
    graph[source][destination] = weight;
  });

  const distances = {};
  const visited = {};
  const previous = {};

  // Initialize distances with Infinity and set source distance to 0
  Object.keys(graph).forEach((vertex) => {
    distances[vertex] = Infinity;
  });
  distances[source] = 0;

  while (true) {
    let closestVertex = null;
    let closestDistance = Infinity;

    // Find the closest unvisited vertex
    Object.keys(graph).forEach((vertex) => {
      if (!visited[vertex] && distances[vertex] < closestDistance) {
        closestVertex = vertex;
        closestDistance = distances[vertex];
      }
    });

    if (closestVertex === null) {
      break; // No reachable vertices left
    }

    // Mark the closest vertex as visited
    visited[closestVertex] = true;

    // Update distances to its neighbors
    Object.keys(graph[closestVertex]).forEach((neighbor) => {
      const distance = closestDistance + graph[closestVertex][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = closestVertex;
      }
    });
  }

  // Reconstruct the shortest path
  const path = [destination];
  let current = destination;
  while (current !== source) {
    current = previous[current];
    path.unshift(current);
  }
  return path;
}

