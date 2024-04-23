const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const jwtHelper = require('../utils/JWTUtils')
const User = require('../Models/user');
const router = express.Router()

router.get('/signupf',async (req, res) => {
    try {
      res.render('sign-up',{loggedIn:false});
    } catch (err) {
      next(err)
    }
})

router.post('/signup',async (req,res)=>{
    try{
        bcrypt.hash(req.body.password, 10).then(
            async (hash) => {
              const user = new User({
                dateNes: req.body.dateNes,
                email: req.body.email,
                password: hash,
                role: req.body.role
              });
              console.log("1")
              const dupUser = await User.findOne({ email: user.email })
              if(dupUser){
                res.status(400).send('User already exists')
              }
              user.save().then(
                () => {
                  let tk = jwtHelper.generateToken(user);
                  res.cookie('token', tk).render('index',{loggedIn:true});
              }
              ).catch(
                (error) => {
                  res.render('sign-up',{loggedIn:false,message:'Invalide Data'});
                }
              );
            }
        );
    }catch(error){
        res.status(400).send(error)
    }
})

router.get('/loginf', async (req, res) => {
    try {
      res.render('sign-in',{loggedIn:false});
    } catch (err) {
      next(err)
    }
})

router.post('/login', (req,res,next)=>{
    let jwtToken;
    User.findOne({ email: req.body.email }).then(
    (user) => {
      if (!user) {
        res.render('sign-in',{loggedIn:false});
      }
      bcrypt.compare(req.body.password, user.password).then(
        (valid) => {
          if (!valid) {
            return res.render('sign-in',{loggedIn:false,message:'Invalide Data'})
          }
            jwtToken = jwtHelper.generateToken(user);
            res.cookie('token', jwtToken).render('index',{loggedIn:true}); 
        }
      ).catch(
        (error) => {
          next(error);
        }
      );
    }
    ).catch(
        (error) => {
            next(error);
        }
    );
})

router.get('/logout',(req, res, next) => {
  try {
    res.clearCookie('token');
    res.render('sign-in',{loggedIn:false})
    } catch (err) {
    next(err)
  }
})

router.get('/index', async (req, res) => {
  try {
      res.render('index.ejs',{loggedIn: req.cookies.token});
  } catch (err) {
      next(err)
    }
})

module.exports=router;