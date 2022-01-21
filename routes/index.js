var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./post');
var localStrategy = require('passport-local');
var passport = require('passport');
const users = require('./users');
const multer = require("multer");
const commentSchema = require('./comment');
const sendMail = require('./nodemailer'); 
const { v4: uuidv4 } = require('uuid')
// const jimp = require('jimp')

passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single("image"), function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (fu) {
      jimp.read(`./public/images/upload/${req.file.filename}`, (err, file) => {
        if (err) throw err;
        file
          .resize(file.bitmap.width * .5, file.bitmap.height * .5) // resize
          .quality(50) // set JPEG quality
          .write(`./public/images/upload/${req.file.filename}`); // save
      });
      fu.image = req.file.filename,
        fu.save()
          .then(function () {
            res.redirect('/profile');
          })
    })
});

router.get('/reset', function (req, res) {
  res.render('resetpassword')
})

router.post('/reset', function (req, res) {
  userModel.findOne({ email: req.body.resetemail })
    .then(function (userData) {
      const secret = uuidv4()
      sendMail(req.body.resetemail, `http://localhost:3000/${userData._id}/${secret}`)
        .then(function () {
          res.send('mailgya')
        });
    });
});

router.get('/:id/:secret', function (req, res) {
  userModel.findOne({ _id: req.params.id })
    .then(function (fu) {
      res.render('newpassword', { fu });
    });
});

router.post('/newpassword/:id', function (req, res) {
  userModel.findOne({ _id: req.params.id })
    .then(function (user) {
      if (req.body.pass1 === req.body.pass2) {
        user.setPassword(req.body.pass1, function (err, result) {
          user.save()
            .then(function (okk) {
              res.send("hogya");
            })
        })
      }
      else {
        res.send("not matched");
      }
    })
})

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/reg', function (req, res) {
  res.render('reg')
});

router.get('/profile', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .populate('post')
    .then(function (lu) {
      postModel.find()
        .populate('user')
        .then(function (cp) {
          res.render('profile', { lu, cp })
        })
    })
});

router.post('/register', function (req, res) {
  var data = new userModel({
    name: req.body.name,
    username: req.body.username,
    dob: req.body.dob,
    email: req.body.email
  })
  users.register(data, req.body.password)
    .then(function (ru) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      });
    })
    .catch(function (err) {
      res.send(err);
    });
});

router.post('/createpost', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (loginuser) {
      postModel.create({
        title: req.body.title,
        imageurl: req.body.imageurl,
        user: loginuser
      })
        .then(function (craetedpost) {
          loginuser.post.push(craetedpost._id)
          loginuser.save()
            .then(function (up) {
              res.redirect('/profile');
            });
        });
    });
});

router.get('/likes/:id', function (req, res) {
  postModel.findOne({ _id: req.params.id })
    .then(function (foundpost) {
      userModel.findOne({ username: req.session.passport.user })
        .then(function (loggedinuser) {
          if (foundpost.likes.indexOf(loggedinuser._id) == -1) {
            foundpost.likes.push(loggedinuser._id);
          }
          else {
            var index = foundpost.likes.indexOf(loggedinuser._id);
            foundpost.likes.splice(index, 1);
          }
          foundpost.save()
            .then(function (done) {
              res.redirect("/profile");
            });
        });
    });
});

router.get('/showlikes/:id', function (req, res) {
  postModel.findOne({ _id: req.params.id })
    .then(function (fp) {
      res.send(fp.likes);
    });
});

router.post('/comments/:id', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (lu) {
      postModel.findOne({ _id: req.params.id })
        .then(function (fp) {
          commentSchema.create({
            author: lu._id,
            comments: req.body.comment
          })
            .then(function (madecomment) {
              fp.comment.push(madecomment._id)
              fp.save()
                .then(function (done) {
                  res.redirect('/profile');
                });
            });
        });
    });
});

router.get('/allcom/:id', isLoggedIn, function (req, res) {
  postModel.findOne({ _id: req.params.id })
    .populate('comment')
    .then(function (com) {
      res.render('comment', { com });
    })
});

router.get('/comlikes/:id', function (req, res) {
  commentSchema.findOne({ _id: req.params.id })
    .then(function (fc) {
      userModel.findOne({ username: req.session.passport.user })
        .then(function (lu) {
          if (fc.comlikes.indexOf(lu._id) == -1) {
            fc.comlikes.push(lu._id);
          }
          else {
            var pos = fc.comlikes.indexOf(lu._id);
            fc.comlikes.splice(pos, 1)
          }
          fc.save()
            .then(function (done) {
              res.redirect(req.headers.referer);
            });
        });
    });
});

router.get('/gotoprofile', function (req, res) {
  res.redirect('/profile');
});

router.get('/delete/:id', function (req, res) {
  postModel.findOneAndDelete({ _id: req.params.id })
    .then(function (du) {
      res.redirect('/profile');
    });
});

router.get('/deletecomment/:id', function (req, res) {
  commentSchema.findOneAndDelete({ _id: req.params.id })
    .then(function (dc) {
      res.redirect('/allcom');
    });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (req, res, next) { });

router.get('/logout', function (req, res) {
  req.logOut();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
};

// router.get('/show', function (req, res) {
//   userModel.findOne({username: req.session.passport.user})
//   .then(function(lu){
//     postModel.findOne({_id:req.params.id})
//     .then(function(fp){
//       commentSchema.create({
//         author: lu._id,
//         comments : req.body.comment
//       })
//       .then(function(madecomment){
//         fp.comment.push(madecomment._id)
//         fp.save()
//         .then(function(done){
//           res.send(done);
//         });
//       });
//     });
//   });

// })


module.exports = router;
