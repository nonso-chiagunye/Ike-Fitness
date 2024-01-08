const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/plan/:slug', authController.isLoggedIn, viewsController.getPlan);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-plans', authController.protect, viewsController.getMyPlans);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;
