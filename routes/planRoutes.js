const express = require('express');
const planController = require('../controllers/planController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:planId/reviews', reviewRouter); // Use this middleware route to enable review router to have access to planId

router
  .route('/top-five-plans')
  .get(planController.topPerformingPlans, planController.getAllPlans);

router.route('/plan-stats').get(planController.getPlanStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'training-coordinator', 'trainer'),
    planController.getMonthlyPlan,
  );

router
  .route('/')
  .get(planController.getAllPlans)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'training-coordinator'),
    planController.createPlan,
  );

router
  .route('/:id')
  .get(planController.getPlan)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'training-coordinator'),
    planController.uploadPlanImages,
    planController.resizePlanImages,
    planController.updatePlan,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'training-coordinator'),
    planController.deletePlan,
  );

module.exports = router;
