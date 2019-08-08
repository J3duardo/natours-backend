const Tour = require("../models/tourModel");

//Tomar todos los tours
exports.getTours = async (req, res) => {
  try {
    //Crear el query
    const queryObj = {...req.query};
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });

    //Filtrado avanzado
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // const query = await Tour.find()
    // .where("duration")
    // .equals(5)
    // .where("difficulty")
    // .equals("easy");
  
    //Ordenar resultados
    if(req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt")
    }

    //Ejecutar el query
    const tours = await query;

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
exports.getSingleTour = async (req, res) => {
  try {
    // const tour = await Tour.findOne({_id: req.params.id});
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error
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
    res.status(400).json({
      status: "fail",
      message: error
    })
  }
};

//Editar tour
exports.editTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)

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