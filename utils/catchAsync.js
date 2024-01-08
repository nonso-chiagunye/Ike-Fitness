// This global function handle rejected asynchronous requests
module.exports = (fn) => {
  // fn is the function we are wrapping/enclosing within catchAsync function
  return (req, res, next) => {
    fn(req, res, next).catch(next); // We are calling fn with req, res, next passed down from catchAsync function and catching the error by sending it to the global error handler
  };
};
