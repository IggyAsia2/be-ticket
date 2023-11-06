const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRouter.js");
const bigTicketRouter = require("./routes/bigTicketRouter");
const groupTicketRouter = require("./routes/groupTicketRouter");
const ticketRouter = require("./routes/ticketRouter");
const orderRouter = require("./routes/orderRouter.js");
const roleRouter = require("./routes/Permission/roleRouter");
const rightRouter = require("./routes/Permission/rightRouter");
const rightGroupRouter = require("./routes/Permission/rightGroupRouter");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerOptions = require("./utils/swagger");

const app = express();

// 1) Global Middleware

// Implement CORS
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["requester", "departure"],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ****Create API Document
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// 2) Routes

app.use("/api/v1/bigTickets", bigTicketRouter);
app.use("/api/v1/groupTickets", groupTicketRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tickets", ticketRouter);
app.use("/api/v1/orders", orderRouter);
// app.use("/api/v1/trucks", truckRouter);

app.use("/api/v1/roles", roleRouter);
app.use("/api/v1/rights", rightRouter);
app.use("/api/v1/right-group", rightGroupRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
