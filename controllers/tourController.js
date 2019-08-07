const fs = require("fs");

//Data de los tours
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//Middleware para chequear si hay ID
exports.checkId = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if(req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    });
  };
  next();
};

//Midleware para validar la data del body de la respuesta
exports.checkBodyData = (req, res, next) => {
  if(!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      results: "Bad request: Missing name or price"
    });
  }
  next();
};

//Tomar la data de los tours
exports.getTours = (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours
    }
  })
};

//Tomar un tour según el parámetro id de la URL
exports.getSingleTour = (req, res) => {
  const id = req.params.id * 1;
  
  const getTour = tours.find(tour => {
    return tour.id === id
  });

  if (!getTour) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID"
    })
  };

  res.status(200).json({
    status: "success",
    data: {
      tour: getTour
    }
  });
};

//Crear un nuevo tour
exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({id: newId}, req.body);

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    })
  });
};

//Editar la data de un tour según la ID especificada en la URL
exports.editTour = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "Updated Tour"
    }
  })
};

//Borrar un tour
exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: "success",
    data: {
      tour: null
    }
  })
};