const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
require('dotenv').config()
const app = express()

app.use(cors())
app.options('*', cors())

// constants
const api = process.env.API_URL
const port = process.env.PORT

// middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)

// routes
const categoriesRoutes = require('./routes/categoriesRoute');
const productsRoutes = require('./routes/productsRoute');
const usersRoutes = require('./routes/usersRoute');
const ordersRoutes = require('./routes/ordersRoute');

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// server & database
mongoose.connect(process.env.CONNECTION_STRING, () => {
    console.log("database connected")
    app.listen(port || 5000, () => {
        console.log("Server live on port 8000")
    })
})