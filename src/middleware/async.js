/*
    Return a function that return a Promise to execute the async function,
    when the async function cannot resolve, we catch errors and pass to next
*/
const asyncHandler = func => (req, res, next) => 
    Promise.resolve(func(req, res, next)).catch(next);

export default asyncHandler;