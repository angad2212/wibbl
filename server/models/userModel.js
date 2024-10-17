const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
);

//this is for comparing the passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); //compares the password by unhashing it first
};

//encrypting the password
//this is a mongoose middleware that runs before the data has been saved in the database
userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  //this.isModified: In Mongoose, this refers to the document being saved. 
  //isModified is a Mongoose method that checks if a field (like the password) has been modified.

  const salt = await bcrypt.genSalt(10); //cost factor of 10
  //Higher values of the cost factor make it more secure but slower.
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;