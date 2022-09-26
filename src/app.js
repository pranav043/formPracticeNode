//Importing npm packages
const express = require('express')
const ejs = require('ejs')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const nodemailer = require('nodemailer')
const chalk = require('chalk')
require('dotenv').config()

//Importing DB File
require('./db/conn')

//App Setup
const app = express()
const port = process.env.PORT || 3000
const db = require('./db/conn')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs')

//Flash Notif Setup
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

//Base Render for /
app.get('/', (req, res) => {
  const fname = req.flash('user')
  res.render('index', { fname })
})

//Rendering post submission
app.post('/', async (req, res) => {
  //body parsing
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

  //Inserting form data to database
  db.collection('details').insertOne(data, (err, collection) => {
    if (err) res.send('<h1>Database Problem!!!</h1>')
    else {
      console.log(
        chalk.magentaBright('Record inserted Successfully in database.')
      )

      //Flash package to notify of submission
      req.flash('user', req.body.fname)

      //Using Nodemailer to notify via mail
      const transporter = nodemailer.createTransport({
        service: 'SendinBlue', // no need to set host or port etc.
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      const userName = fname + lname

      //Rendering the HTML data we will mail to admin
      ejs.renderFile(
        './views/mailView.ejs',
        {
          userName: userName,
          email: email,
          phone: phone,
        },
        (err, mailData) => {
          if (err) {
            console.log(chalk.red('Unable to send mail: ') + err)
          } else {
            transporter
              .sendMail({
                to: process.env.SMTP_USERNAME,
                from: 'admin@formPractice.com',
                subject: 'NEW USER FORM SUBMITTED',
                html: mailData,
              })
              .then((res) =>
                console.log(chalk.blueBright('Email Successfully sent!'))
              )
              .catch((err) =>
                console.log(chalk.redBright('Unable to send Email: ') + err)
              )
          }
        }
      )

      //Redirecting to same page
      res.redirect('/')
    }
  })
})

app.listen(port, function () {
  console.log(chalk.cyan(`Example app listening on port ${port}`))
})
