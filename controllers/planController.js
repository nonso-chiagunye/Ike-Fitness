const multer = require('multer');
const sharp = require('sharp');
const Plan = require('../models/planModel');
const APIQueries = require('../utils/apiQueries');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryFunction');

// Multer used to handle file uploads (multipart/form-data). First store the file in memory
const multerStorage = multer.memoryStorage();

// Only accept image file type.
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
// multer specific upload function
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Upload image to plan
exports.uploadPlanImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// Resizing uploaded image with sharp
exports.resizePlanImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `plan-${req.params.id}-${Date.now()}-cover.jpeg`; // Give image a unique name/label
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/plans/${req.body.imageCover}`); // Save image in img/plans directory

  // 2) Plan Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `plan-${req.params.id}-${Date.now()}-${i + 1}.jpeg`; // Give images unique names/labels

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/plans/${filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});

// Get top 5 performing plans (Highest rated and cheapest price)
exports.topPerformingPlans = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,description,difficulty';
  next();
};

exports.getAllPlans = factory.getAll(Plan);
exports.getPlan = factory.getOne(Plan, { path: 'reviews' });
exports.createPlan = factory.createOne(Plan);
exports.updatePlan = factory.updateOne(Plan);
exports.deletePlan = factory.deleteOne(Plan);

// Get a statistics of best performing plans (gte 4.5 rating), grouped by their difficulty
exports.getPlanStats = catchAsync(async (req, res, next) => {
  const stats = await Plan.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numPlans: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Get plans starting at specific months of the year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Plan.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numPlanStarts: { $sum: 1 },
        plans: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numPlanStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
