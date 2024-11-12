require('dotenv/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const productsRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const usersRouter = require('./routers/users')
const ordersRouter = require('./routers/orders')
const api = process.env.API_URL
const cors = require('cors')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
// MIDDLEWARE
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use('public/upload', express.static(__dirname + 'public/uploads'))
app.use(errorHandler)
console.log('API URL:', api)
// ROUTERS.....
app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/users`, usersRouter)
app.use(`${api}/orders`, ordersRouter)

mongoose
    .connect(process.env.CONNECTION_STRING)
    .then(() => {
        console.log('connected with db')
    })
    .catch((err) => console.log(err))
app.listen(3000, () => console.log(`server is running on port: 3000`))
