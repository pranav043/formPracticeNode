const mongoose = require('mongoose')
require('dotenv').config()

main().catch((err) => {
  console.log('Error!!! Unable to connect to database.')
})

async function main() {
  await mongoose
    //For Local database- .connect('mongodb://localhost:27017/databaseName')
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log('Successfully connected to database!!!')
    })
}
const db = mongoose.connection

module.exports = db
