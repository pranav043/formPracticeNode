const express = require('express')
const ejs = require('ejs')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
require('./db/conn')

const app = express()
const port = process.env.PORT || 3000
const db = require('./db/conn')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(cookieParser('NotSoSecret'))
app.use(
  session({
    secret: 'something',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
)
app.use(flash())

app.get('/', (req, res) => {
  const fname = req.flash('user')
  res.render('index', { fname })
})

app.post('/', async (req, res) => {
  const fname = req.body.fname
  const lname = req.body.lname
  const email = req.body.email
  const phone = req.body.phone

  const data = {
    fname: fname,
    lname: lname,
    email: email,
    phone: phone,
  }
  db.collection('details').insertOne(data, (err, collection) => {
    if (err) res.send('<h1>Database Problem!!!</h1>')
    else {
      console.log('Record inserted Successfully')
      req.flash('user', req.body.fname)
      res.redirect('/')
    }
  })
})

app.listen(port, function () {
  console.log(`Example app listening on port ${port}`)
})
