/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
// const Stripe = require('stripe');

export const bookPlan = async (planId) => {
  const stripe = Stripe(
    'pk_test_51OUXCgIIICW1mkAIzq94x5iTlCr2EiegIGg4Qx797h1HFh5YDyuokLOTYi3K6rnUfpaK1e8OLkegZhDqjxCtl4dJ00Ndwgs9xj',
  );

  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${planId}`); // Make axios call to the checkout-session api

    // 2) Create checkout form
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
