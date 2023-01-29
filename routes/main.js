const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const db = require('../model')
const data = {
  skills: db.get('skills').value(),
  products: db.get('products').value()
}


router.get('/', (req, res, next) => {
  res.render('pages/index', { title: 'Main page', ...data, msgemail: req.flash('mail')[0] })
})

router.post('/', (req, res, next) => {
  
  if (!req.body.name || !req.body.email || !req.body.message) {
    return (req.flash('mail', 'Все поля должны быть заполнены'),
    res.redirect('/#mail'))
    
  }

  

  const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure:true,
    auth: {
        user: 'mizikova_y@mail.ru',
        pass: '6RDUUY3UPiUyNHazMavh'
    }
  })
  

  const message = {
    from: 'Mailer Test <mizikova_y@mail.ru>',
    to: req.body.email,
    subject: "Письмо успешно отправлено",
    text: 'Добрый день! Ваше письмо успешно отправлено'

  }
  

  const SENDMAIL = async (message, callback) => {
    try {
      const info = await transporter.sendMail(message)
      callback(info)
    } catch (error) {
      console.log(error)
      req.flash('mail', 'При отправке произошла ошибка')
      res.redirect('/#mail')
    } 
  }

  SENDMAIL(message, (info) => {
    req.flash('mail', 'Письмо успешно отправлено!')
    res.redirect('/#mail')
});


})

  

module.exports = router
