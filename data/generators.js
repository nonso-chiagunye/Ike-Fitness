// The below scripts are used to generate unique ObjectIds and encrypt passwords of users loaded directly to the db
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

// GENERATE OBJECTID FOR 27 DB DOCUMENTS
for (let i = 1; i <= 27; i++) {
  const myObjectId = new ObjectId();

  console.log(myObjectId);
}

// GENERATE HASHED PASSWORD FOR USERS
const password = 'examplePassword';
const saltRounds = 12; // The cost parameter

// Generate a salt and hash the password
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.log('Error hashing password:', err);
  } else {
    console.log(hash);
  }
});

// Run the script
// node generators.js
