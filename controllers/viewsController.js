const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const ErrorHandler = require("../utils/errorHandler");

//Mostrar todos los tours en el homepage
exports.getOverview = async (req, res, next) => {
  try {
    //Tomar toda la data de los tours desde la API y ordenarlos desde el más reciente
    const tours = await Tour.find().sort({_id: -1});
  
    //Renderizar el template usando la data de los tours
    res.status(200).render("overview", {
      title: "All tours",
      subtitle: null,
      tours: tours
    })

  } catch(error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem getting the tours. Try again later", 404))
    }
    return next(new ErrorHandler(error, 404));
  }
}

//Mostrar los detalles de cada tour
exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({slug: req.params.tourSlug}).populate({
      path: "reviews",
      fields: "review rating author",
      options: { sort: {createdAt: -1}}
    });

    if (!tour) {
      return next(new ErrorHandler("There's no tour with that name", 404))
    }
    
    res.status(200).render("tour", {
      title: tour.name,
      tour: tour
    });

  } catch(error) {
    if(process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Tour not found", 404))
    }

    return next(new ErrorHandler(error, 404));
  }
}

//Mostrar formulario de login
exports.login = async (req, res, next) => {
  try {
    res.status(200).render("login", {
      title: "Login"
    });

  } catch(error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem, try again later.", 500))
    }
    return next(new ErrorHandler(error, 500));
  }
}

//Mostrar formulario de signup
exports.signup = async (req, res, next) => {
  try {
    res.status(200).render("signup", {
      title: "Signup"
    });

  } catch(error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem, try again later.", 500))
    }
    return next(new ErrorHandler(error, 500));
  }
}

//Mostrar formulario de email de restablecimiento de contraseña
exports.forgotPasswordForm = async (req, res, next) => {
  try {
    res.status(200).render("forgotPassword", {
      title: "Forgot your password?"
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem, try again later.", 500))
    }
    return next(new ErrorHandler(error, 500));
  }
}

//Mostrar formulario de reseteo de contraseña 
exports.resetPasswordForm = async (req, res, next) => {
  try {
    res.status(200).render("resetPassword", {
      title: "Reset your password",
      token: req.params.token
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem, try again later.", 500))
    }
    return next(new ErrorHandler(error, 500));
  }
}

//Mostrar formulario de creación de reviews
exports.addReview = async (req, res, next) => {
  try {
    res.status(200).render("createReview", {
      title: "Add review",
      tour: req.params.tourId
    })

  } catch(error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("Sorry! There was a problem, try again later.", 500))
    }
    return next(new ErrorHandler(error, 500));
  }
}

//Renderizar la página del usuario logueado
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account"
  });
}

//Mostrar la página de los bookings del usuario
exports.getMyTours = async (req, res, next) => {
  try {
    //Encontrar los bookings del usuario
    const bookings = await Booking.find({user: req.user.id});
  
    //Encontrar los tours e los bookings
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({_id: {$in: tourIds}});
  
    res.status(200).render("overview", {
      title: "My Tours",
      subtitle: "My booked tours",
      tours: tours
    });

  } catch(error) {
    return next(new ErrorHandler(error, 400))
  }
}