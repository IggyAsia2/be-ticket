const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const bodyParser = require("body-parser");

const cronJob = require("./utils/cronJob.js");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRouter.js");
const bigTicketRouter = require("./routes/bigTicketRouter");
const groupTicketRouter = require("./routes/groupTicketRouter");
const ticketRouter = require("./routes/ticketRouter");
const sunRouter = require("./routes/sunRouter.js");
const orderRouter = require("./routes/orderRouter.js");
const departRouter = require("./routes/departRouter.js");
const importHistoryRouter = require("./routes/importHistoryRouter.js");
const roleRouter = require("./routes/Permission/roleRouter");
const rightRouter = require("./routes/Permission/rightRouter");
const rightGroupRouter = require("./routes/Permission/rightGroupRouter");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerOptions = require("./utils/swagger");

const app = express();

// 1) Global Middlewares

// Implement CORS
app.use(cors());

// Set security HTTP headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

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
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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
app.use(express.static("public"));

// app.use(express.static(path.join(__dirname, 'public')));

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
app.use("/api/v1/departs", departRouter);
app.use("/api/v1/importHistory", importHistoryRouter);
app.use("/api/v1/suns", sunRouter);

app.use("/api/v1/roles", roleRouter);
app.use("/api/v1/rights", rightRouter);
app.use("/api/v1/right-group", rightGroupRouter);

cronJob.autoUpdateOrder(10);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
