import {logger} from "../configs/logger";

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const errorHandler = (err, req, res, next) => {
  // treat as 404
  if (
    err.message &&
    (~err.message.indexOf("not found") ||
      ~err.message.indexOf("Cast to ObjectId failed"))
  ) {
    return next();
  }
//   const env = process.env.NODE_ENV || "development";
  logger.error("Error: " + JSON.stringify(err));
  logger.error("Received Error Stack : " + err.stack);
//   if(env !== "development"){
//     errorEmail(req.url,JSON.stringify(err),err.stack);
//   }
  
  // error page
   res.status(200).json({ msg: "Something went wrong. Please contact admin!!!", isSuccess: false });

};

// catch 404 and forward to error handler
export const error404 = (req, res, next) => {
    res.status(404).json({ error: "Not found", isSuccess: false });
};


