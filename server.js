const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./app/models/index');
const authRoutes  = require("./app/routers/authRouter");
const userRoutes  = require("./app/routers/userRouter");


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
require("./app/routers/roleRouter")(app);

//uncomment to create tables

sequelize.sync().then(() => {
  console.log('Database synced');
}).catch((error) => {
  console.error('Error syncing database:', error);
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
