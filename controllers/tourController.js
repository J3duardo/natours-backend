const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");

//Tomar todos los tours
exports.getTours = async (req, res) => {
  try {
    //Ejecutar el query
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours: tours
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Tomar un tour por su ID
exports.getSingleTour = async (req, res, next) => {
  try {
    // const tour = await Tour.findOne({_id: req.params.id});
    const tour = await Tour.findById(req.params.id);

    if(!tour) {
      return next(new ErrorHandler("No tour found for that ID", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    });
  } catch (error) {
    let err = {...error}
    if (process.env.NODE_ENV === "production") {
      const newMessage = `Invalid ${error.path}: ${error.value}`
      err = new ErrorHandler(newMessage, 404).message
    }
    res.status(404).json({
      status: "fail",
      message: err
    })
  }
};

//Crear tour
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
  
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    })
  } catch (error) {
    let err = {...error}
    if (process.env.NODE_ENV === "production") {
      if (err.code === 11000) {
        const value = err.errmsg.split(":")
        const message = `Duplicate field: ${value[value.length - 1].replace(" \"", "").replace("\" }", "")}. Please try another name.`;
        err = new ErrorHandler(message, 400).message
      }
    }
    res.status(400).json({
      status: "fail",
      message: err
    })
  }
};

//Editar tour
exports.editTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      // runValidators: true
    });

    if(!tour) {
      return next(new ErrorHandler("No tour found for that ID", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Borrar tour
exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour) {
      return next(new ErrorHandler("No tour found for that ID", 404))
    }

    res.status(204).json({
      status: "success",
      data: {
        tour: null
      }
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Calcular y agrupar las estadísticas de los tours
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage: {$gte: 4.5}}
      },
      {
        $group: {
          _id: "$difficulty",
          numTours: {$sum: 1},
          avgRating: {$avg: "$ratingsAverage"},
          numRaitings: {$sum: "$ratingsQuantity"},
          avgPrice: {$avg: "$price"},
          minPrice: {$min: "$price"},
          maxPrice: {$max: "$price"},
        }
      },
      {
        $sort: {avgPrice: 1}
      }
    ]);
    res.status(200).json({
      status: "success",
      data: {
        stats: stats
      }
    });
  } catch (error) {
      res.status(404).json({
      status: "fail",
      message: error
    })
  }
};

//Obtener el número de tours por mes de inicio
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates"
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {$month: "$startDates"},
          numToursStarts: {$sum: 1},
          tours: {$push: "$name"}
        }
      },
      {
        $addFields: {month: "$_id"}
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {numToursStarts: -1}
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        plan: plan
      }
    })
  } catch (error) {
      res.status(404).json({
      status: "fail",
      message: error
    })
  }
}