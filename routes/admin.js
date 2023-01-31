const express = require('express')
const router = express.Router()
const db = require('./../model')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')

const validation = (fields, files) => {
  if (files.photo.originalFilename === '' || files.photo.size === 0) {
    return { status: 'Не загружена картинка!', err: true }
  }
  if (!fields.name) {
    return { status: 'Не указано описание товара!', err: true }
  }
  if (!fields.price) {
     return { status: 'Не указана цена товара!', err: true }
  }
  return { status: 'Ok', err: false }
}

const validationSkills = (fields) => {
    if (!fields.age) {
    return { status: 'Не указан возраст начала занятий на скрипке', err: true }
  }
  if (!fields.concerts) {
     return { status: 'Не указано сколько концертов отыграл', err: true }
  }
  if (!fields.cities) {
    return { status: 'Не указано максимальное число городов в туре', err: true }
 }
 if (!fields.years) {
  return { status: 'Не указано сколько лет на сцене в качестве скрипача', err: true }
}
if (fields.age < 0) {
  return { status: 'Возраст начала занятий на скрипке не может быть отрицательным', err: true }
}
if (fields.concerts < 0) {
   return { status: 'Количество концертов не может быть отрицательным', err: true }
}
if (fields.cities < 0) {
  return { status: 'Число городов не может быть отрицательным', err: true }
}
if (fields.years < 0) {
return { status: 'Стаж не может быть отрицательный', err: true }
}
  return { status: 'Ok', err: false }
}


router.get('/', (req, res, next) => {
  // TODO: Реализовать, подстановку в поля ввода формы 'Счетчики'
  // актуальных значений из сохраненых (по желанию)
  if (!req.session.auth) {
    req.flash('login', 'Авторизуйтесь!!!')
    return res.redirect('/login')
  }
  
  res.render('pages/admin', { title: 'Admin page', msgfile: req.flash('file')[0], msgskill: req.flash('skills')[0] })
})

router.post('/skills', (req, res, next) => {

const {age, concerts, cities, years} = req.body

const valid = validationSkills({age, concerts, cities, years})


if(valid.err) {
      console.log(valid.status)
      req.flash('skills', valid.status)
      return res.redirect('/admin')
}

db.set("skills", [{
  "number": age,
  "text": "Возраст начала занятий на скрипке"
},
{
  "number": concerts,
  "text": "Концертов отыграл"
},
{
  "number": cities,
  "text": "Максимальное число городов в туре"
},
{
  "number": years,
  "text": "Лет на сцене в качестве скрипача"
}]).write()
req.flash('skills', "Данные успешно загружены")
res.redirect('/admin')

  
})

 router.post('/upload', (req, res, next) => {
 
   const form = new formidable.IncomingForm()
   const upload = path.join('./uploads', 'assets', 'img', 'products')

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload, { recursive: true })
  }

  form.uploadDir = path.join(process.cwd(), upload)
  
  form.parse(req, function (err, fields, files) {
    if (err) {
      return next(err)
    }

    const valid = validation(fields, files)

    if (valid.err) {
      fs.unlinkSync(files.photo.filepath)
      console.log(valid.status)
      req.flash('file', valid.status)
      return res.redirect('/admin')
    }

    console.log(files.photo.filepath)
    const fileName = path.join(upload, files.photo.originalFilename)

    fs.rename(files.photo.filepath, fileName, function (err) {
       if (err) {
       console.log(err.message)
       }
    })

    const src = path.join('./assets', 'img', 'products', files.photo.originalFilename)
       

     db.get('products').push(
      {
        "src": src,
        "name": fields.name,
       "price": fields.price
       }
    ).write()
    req.flash('file', "Данные успешно загружены")
    res.redirect('/admin')

  })



  
}) 

module.exports = router
