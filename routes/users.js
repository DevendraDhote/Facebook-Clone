const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://localhost/frface");


const userSchema = mongoose.Schema({
  name: String,
  username: String,
  dob: String,
  password: String,
  email: String,
  secret : {
    type : String,
    expiry : Date.now()+24*60*60*1000
  },
  post: [{
    type : mongoose.Schema.Types.ObjectId,
    ref: "postt"
  }],
  image : [{
    type : String,
    default : "def.jpg"
  }]
});



userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);