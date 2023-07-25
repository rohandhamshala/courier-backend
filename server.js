const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./app/models/index');
const authRoutes  = require("./app/routers/authRouter");
const userRoutes  = require("./app/routers/userRouter");
const db = require("./app/models");
const Graph = db.graph;

const cors = require("cors");

const app = express();
const PORT = 3200;

let corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
app.options("*", cors());

app.get('/',(req,res)=>{
  res.send("Welcome to OKC couriers backend!")
})

app.use(bodyParser.json());
app.use(authRoutes);
app.use(userRoutes);
require("./app/routers/customerRouter")(app);
require("./app/routers/orderRouter")(app);
require("./app/routers/paymentRouter")(app);
require("./app/routers/roleRouter")(app);

//uncomment to create tables

sequelize.sync().then(() => {
  console.log('Database synced');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

const graph = {
  '1A': { '2A': 1},
  '1B': { '1A': 1},
  '1C': { '1B': 1, '2C': 1},
  '1D': { '1C': 1, '2D': 1},
  '1E': { '1D': 1, '2E': 1},
  '1F': { '1E': 1},
  '1G': { '1F': 1, '2G': 1},
  '2A': { '3A': 1, '2B': 1},
  '3A': { '4A': 1},
  '4A': { '5A': 1, '4B': 1},
  '5A': { '6A': 1},
  '6A': { '7A': 1, '6B': 1},

'2B': { '1B': 1, '2A': 1, '2C': 1},
'2C': { '3C': 1, '2B': 1, '2D': 1},
'2D': { '1D': 1, '2C': 1, '2E': 1, '3D': 1},
'2E': { '3E': 1, '2D': 1, '2F': 1},
'2F': { '1F': 1, '2E': 1, '2G': 1},
'2G': { '3G': 1, '2F': 1},

'3B': { '2B': 1, '3A': 1},
'3C': { '4C': 1, '3B': 1},
'3D': { '4D': 1, '3C': 1, '2D': 1},
'3E': { '3D': 1, '4E': 1},
'3F': { '3E': 1, '2F': 1},
'3G': { '3F': 1, '4G': 1},

'4B': { '4C': 1, '3B': 1},
'4C': { '5C': 1, '4D': 1},
'4D': { '3D': 1, '5D': 1, '4E': 1},
'4E': { '4F': 1, '5E': 1},
'4F': { '4G': 1, '3F': 1},
'4G': { '5G': 1},

'5B': { '5A': 1, '4B': 1},
'5C': { '5B': 1, '6C': 1},
'5D': { '4D': 1, '6D': 1, '5C': 1},
'5E': { '5D': 1, '6E': 1},
'5F': { '4F': 1, '5E': 1},
'5G': { '5F': 1, '6G': 1},

'6B': { '5B': 1, '6A': 1, '6C': 1},
'6C': { '6B': 1, '6D': 1, '7C': 1},
'6D': { '6C': 1, '6E': 1, '5D': 1, '7D': 1},
'6E': { '6D': 1, '6F': 1, '7E': 1},
'6F': { '6E': 1, '6G': 1, '5F': 1},
'6G': { '6F': 1, '7G': 1},

'7B': { '6B': 1, '7A': 1},
'7C': { '7B': 1},
'7D': { '6D': 1, '7C': 1},
'7E': { '7D': 1},
'7F': { '7E': 1, '6F': 1},
'7G': { '7F': 1},
};

// Function to populate the Graph table with data
const populateGraphTable = async () => {
  try {
    await sequelize.sync(); // Sync models with the database

    // Clear existing data from the Graph table
    await Graph.destroy({ truncate: true });

    // Bulk insert the graph data into the Graph table
    const graphData = [];

    Object.entries(graph).forEach(([source, destinations]) => {
      Object.entries(destinations).forEach(([destination, weight]) => {
        graphData.push({ source, destination, weight });
      });
    });

    await Graph.bulkCreate(graphData);

    console.log('Graph table populated successfully.');
  } catch (error) {
    console.error('Error populating Graph table:', error);
  }
};
populateGraphTable();


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
