// Use these scripts to load or delete data to different db collection
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('../models/planModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

dotenv.config({ path: './config.env' }); // path to secret file

const DB = process.env.DATABASE.replace(
  // Store password part of the db url in seperate variable and read it with js string method replace()
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose // Connect to the db
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILES SYNCHRONOUSLY (You only have to read once)
const plans = JSON.parse(fs.readFileSync(`${__dirname}/plans.json`, 'utf-8')); // read plans.json data synchronously
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')); // read users.json data synchronously
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
); // read reviews.json data synchronously

// WRITE DATA INTO DB ASYNCHRONOUSLY
const importData = async () => {
  try {
    await Plan.create(plans); // Write to Plan collection asynchronously
    await User.create(users, { validateBeforeSave: false }); // Write to User collection asynchronously (temporarily disable input validation, and also remember to turn off all pre save hooks at the User chema)
    await Review.create(reviews); // Write to Review collection asynchronously
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM A DB COLLECTION
const deleteData = async () => {
  try {
    await Plan.deleteMany(); // Delete from Plan collection asynchronously
    await User.deleteMany(); // Delete from User collection asynchronously
    await Review.deleteMany(); // Delete from Review collection asynchronously
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  // node ./data/import-data.js --import
  importData();
} else if (process.argv[2] === '--delete') {
  // node ./data/import-data.js --delete
  deleteData();
}
