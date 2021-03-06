const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const ErrorHandler = require("./utils/errorHandler");
const errorController = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

//Inicializar la API
const app = express();

app.enable("trust proxy");

//Establecer el view engine y las rutas a los views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// ------- Middlewares globales -------- //

//Implementación de CORS
app.use(cors());
//Implementar CORS en todos los tipos de request, además de get y post
app.options("*", cors());

//Middleware para crear headers HTTP seguros
app.use(helmet());

//Middleware para leer archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

//Middleware para loguear en consola en ambiente de desarrollo
if(process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Middleware para limitar la cantidad de peticiones por hora para evitar ataques DOS
const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: "Too many request from this IP, please try again later"
});
app.use("/api", limiter);

//Middlewarepara parsear la data del body
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//Limpieza de data contra ataques NoSQL Query Injection
app.use(mongoSanitize());

//Limpieza de data contra ataques XSS
app.use(xss());

//Comprimir la data enviada al usuario
app.use(compression());

//Middleware de las Rutas
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
app.all("*", (req, res, next) => {
  next(new ErrorHandler("Page not found! Sorry, but that page doesn't seem to exist.", 404));
})

app.use(errorController);

module.exports = app;
