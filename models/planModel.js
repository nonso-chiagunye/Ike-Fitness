const mongoose = require('mongoose');
const slugify = require('slugify');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A plan must have a name'],
      unique: true,
      trim: true,
      maxlength: [60, 'A plan name must have less or equal than 60 characters'],
      minlength: [10, 'A plan name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    goal: {
      type: String,
      trim: true,
      required: [true, 'A plan must have a goal'],
    },
    components: [String],
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A plan must have a duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'A plan must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A plan must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A plan must have a description'],
    },
    // description: {
    //   type: String,
    //   trim: true,
    // },
    imageCover: {
      type: String,
      required: [true, 'A plan must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    executivePlan: {
      type: Boolean,
      default: false,
      select: false,
    },
    trainers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

planSchema.index({ price: 1, ratingsAverage: -1 });

planSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

planSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'plan',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
planSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
planSchema.pre(/^find/, function (next) {
  this.find({ executivePlan: { $ne: true } });

  this.start = Date.now();
  next();
});

planSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'trainers',
    select: '-__v -passwordChangedAt',
  });

  next();
});

planSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
planSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { executivePlan: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
