const mongoose = require('mongoose');
const Plan = require('./planModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please write your review!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    plan: {
      type: mongoose.Schema.ObjectId, // A reference field for the Plan Model
      ref: 'Plan',
      required: [true, 'Review must belong to a fitness plan.'],
    },
    user: {
      type: mongoose.Schema.ObjectId, // A reference field for the User Model
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create index for plan and user fields
reviewSchema.index({ plan: 1, user: 1 }, { unique: true });
// QUERY MIDDLEWARE: runs before .find() and populate with name and photo
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Static method on review schema
reviewSchema.statics.calcAverageRatings = async function (planId) {
  const stats = await this.aggregate([
    {
      $match: { plan: planId },
    },
    {
      $group: {
        _id: '$plan',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Plan.findByIdAndUpdate(planId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Plan.findByIdAndUpdate(planId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// DOCUMENT MIDDLEWARE: runs after .save()
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.plan);
});

// QUERY MIDDLEWARE: runs before .findOneAnd()
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.rev.constructor.calcAverageRatings(this.rev.plan);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
