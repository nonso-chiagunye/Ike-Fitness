<div align="center" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
  <img src="/public/img/ike-purple.png" alt="Ike Fitness" width="200"/>
</div>

<h1 align="center">Ike Fitness</h1>

<p align="center">A fitness booking API built on <a href="https://nodejs.org">NodeJS</a></p>

---

## Key Features

- Get all available fitness plans
- Get a specific fitness plan based on the planId
- Get fitness plans using different url queries like price range, rating, start date, difficulty, goals, etc
- Sort the output, limit output fields and number of documents per output
- User signup, login, logout, optout
- Forgot password request, use token sent to email address to create new password
- Update data or password
- Post a review and rating on a fitness plan, trainer, etc
- Perform different **CRUD** operations on the four routes: Plans, Users, Reviews and Bookings
- Book a plan by creating a checkout on a plan you like. Complete the booking on browser (You can use Stripe's 4242 4242 4242 4242 test payment card)
- Some of these features are also available on a rendered client side version

## Underlying Technologies

| Name                                                                | Description                    |
| :------------------------------------------------------------------ | :----------------------------- |
| [NodeJS](https://nodejs.org/)                                       | Runtime Engine                 |
| [ExpressJS](https://expressjs.com/)                                 | JS Web Framework               |
| [Stripe](https://stripe.com/)                                       | Payment processor              |
| [Pug](https://pugjs.org/)                                           | Templating                     |
| [Parcel](https://parceljs.org/)                                     | Bundler                        |
| [Bcryptjs](https://www.npmjs.com/package/bcryptjs/)                 | Encryption                     |
| [JSONWebToken](https://www.npmjs.com/package/jsonwebtoken/)         | Token signing and verification |
| [Slugify](https://www.npmjs.com/package/slugify/)                   | URL slug generator             |
| [MongoDB](https://www.mongodb.com/)                                 | NoSQL Database                 |
| [Mongoose](https://mongoosejs.com/)                                 | MongoDB ODM library            |
| [Nodemailer](https://nodemailer.com/)                               | Email sender                   |
| [Mailtrap](https://www.mailtrap.io/)                                | Email transporter (Dev)        |
| [Axios](https://axios-http.com/)                                    | HTTP Client                    |
| [Multer](https://expressjs.com/en/resources/middleware/multer.html) | Mulipart/Form-data             |
| [Sharp](https://www.npmjs.com/package/sharp)                        | Image processing               |

## Available Endpoints

Here is a detailed test on [Postman](https://documenter.getpostman.com/view/30669455/2s9YsKfrKo)

### Base url

> https://ike-fitness.onrender.com

### Routes

> Plans: /api/v1/plans
>
> Users: /api/v1/users
>
> Reviews: /api/v1/reviews
>
> Bookings: /api/v1/bookings

#### Plan Routes

| Method | URL                                                                                         | Description                                                                                                                                                 |
| :----- | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /api/v1/plans                                                                               | Get all fitness plans                                                                                                                                       |
| POST   | /api/v1/plans                                                                               | Create a plan. Requires admin access                                                                                                                        |
| GET    | /api/vi/plans/:id                                                                           | Get specific plan with its id                                                                                                                               |
| PATCH  | /api/v1/plans/:id                                                                           | Update a plan. Requires admin access                                                                                                                        |
| DELETE | /api/v1/plans/:id                                                                           | Delete a plan. Requires admin access                                                                                                                        |
| GET    | /api/v1/plans/monthly-plan/:year                                                            | Get the months each plan is starting in year                                                                                                                |
| GET    | /api/v1/plans/top-five-plans                                                                | Get the 5 best plans (Best rated and lowest price)                                                                                                          |
| GET    | /api/v1/plans/:planId/reviews                                                               | Get the reviews of a plan                                                                                                                                   |
| GET    | /api/v1/plans?price[lte]=400&ratingsAverage[gt]=4.5&sort=-rating&fields=name,goal,startDate | Get plans with price less than 400 and average rating greater than 4.5, and sort by rating in descending order, and display only name, goal and start dates |

#### User Routes

| Method | URL                                | Description                        |
| :----- | :--------------------------------- | :--------------------------------- |
| POST   | /api/v1/users/signup               | User signup                        |
| POST   | /api/v1/users/login                | User login                         |
| GET    | /api/v1/users/logout               | User logout                        |
| POST   | /api/v1/users/forgotPassword       | Request password reset token       |
| PATCH  | /api/v1/users/resetPassword/:token | Reset password with the sent token |
| PATCH  | /api/v1/users/updateMyPassword     | Change my password                 |
| GET    | /api/v1/users/me                   | Show my data                       |
| PATCH  | /api/v1/users/updateMe             | Update my information              |
| DELETE | /api/v1/users/deleteMe             | User optout                        |
| GET    | /api/v1/users                      | Get all users. Admin only          |
| POST   | /api/v1/users                      | Create a new user                  |
| GET    | /api/v1/users/:id                  | Get a specific user                |
| PATCH  | /api/v1/users/:id                  | Update a user's information        |
| DELETE | /api/v1/users/:id                  | Delete a user                      |

#### Review Routes

| Method | URL                 | Description               |
| :----- | :------------------ | :------------------------ |
| GET    | /api/v1/reviews     | Get all reviews           |
| POST   | /api/v1/reviews     | Create review (on a plan) |
| GET    | /api/v1/reviews/:id | Get a review              |
| PATCH  | /api/v1/reviews/:id | Update a review           |
| DELETE | /api/v1/reviews/:id | Delete a review           |

#### Booking Routes

| Method | URL                                       | Description                                                 |
| :----- | :---------------------------------------- | :---------------------------------------------------------- |
| GET    | /api/v1/bookings/checkout-session/:planId | Get booking checkout session on a plan (book a plan)        |
| GET    | /api/v1/bookings                          | Get all bookings. Requires admin access                     |
| POST   | /api/v1/bookings                          | Create a booking on behalf of a user. Requires admin access |
| GET    | /api/v1/bookings/:id                      | Get a booking                                               |
| PATCH  | /api/v1/bookings/:id                      | Update a booking                                            |
| DELETE | /api/v1/bookings/:id                      | Delete a booking                                            |
