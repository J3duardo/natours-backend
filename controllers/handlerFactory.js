const ErrorHandler = require("../utils/errorHandler");
const APIFeatures = require("../utils/apiFeatures");
const {validationErrors, duplicateDataErrors, castErrors} = require("../utils/dataErrorsHandler");


//------Operaciones CRUD------//

//Borrar un documento
exports.deleteOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
  
      if(!doc) {
        return next(new ErrorHandler("No document found for that ID", 404))
      }

      //Recalcular el averageRatings después de borrar un review
      if(Model.modelName === "Review") {
        Model.calcAverageRatings(doc.tour._id)
      }
  
      res.status(204).json({
        status: "success",
        data: {
          doc: null
        }
      })
    } catch (error) {
      let err = Object.create(error)
      
      if (process.env.NODE_ENV === "production") {
        if(error.name === "CastError") {
          err = castErrors(error)
        }
      }
  
      return next(new ErrorHandler(err, 404));
    }
  }
}

//Actualizar un documento
exports.updateOne = (Model) => {
  return async (req, res, next) => {
    try {
      
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if(!doc) {
        return next(new ErrorHandler("No document found for that ID", 404))
      }

      //Recalcular el averageRatings después de editar el rating de un review
      if(Model.modelName === "Review") {
        Model.calcAverageRatings(doc.tour._id)
      }  
  
      res.status(200).json({
        status: "success",
        data: {
          data: doc
        }
      })
    } catch (error) {
      let err = Object.create(error);

      if (process.env.NODE_ENV === "production") {
        if (err.name === "ValidationError") {
          err = validationErrors(error)
        }
  
        if(err.code === 11000) {
          err = duplicateDataErrors(error)
        }
  
        if(error.name === "CastError") {
          err = castErrors(error)
        }
      }
      
      return next(new ErrorHandler(err, 404));
    }
  }
}

//Crear un documento
exports.createOne = (Model) => {
  return async (req, res, next) => {
    //Si se va a crear un review tomando la ID desde los parámetros dela URL, hacer:
    if (Model.modelName === "Review") {
      if (!req.body.tour) {
        req.body.tour = req.params.tourId;
      }
      if (!req.body.author) {
        req.body.author = req.user.id
      }
    }

    try {
      const newDoc = await Model.create(req.body);
    
      res.status(201).json({
        status: "success",
        data: {
          data: newDoc
        }
      })

    } catch (error) {
      let err = Object.create(error);

      if (process.env.NODE_ENV === "production") {
        if (err.code === 11000) {
          err = duplicateDataErrors(error)
        }
        if (err.name === "ValidationError") {
          err = validationErrors(error)
        }
      }

      return next(new ErrorHandler(err, 400));
    }
  }
}

//Leer la información de un documento
exports.getOne = (Model, populateOptions) => {
  return async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id || req.user.id);

      //Chequear si el documento solicitado requiere ejecutar populate()
      if (populateOptions) {
        query = query.populate(populateOptions);
      }

      const document = await query;
  
      if(!document) {
        return next(new ErrorHandler("No document found for that ID", 404))
      }
  
      res.status(200).json({
        status: "success",
        data: {
          data: document
        }
      });
    } catch (error) {
      let err = Object.create(error);

      if (process.env.NODE_ENV === "production") {
        if(error.name === "CastError") {
          err = castErrors(error)
        }
      }

      return next(new ErrorHandler(err, 404));
    }
  }
}

//Leer la data de todos los documentos de una colección
exports.getAll = (Model) => {  
  return async (req, res, next) => {
    try {
      //Filtrar los tours por la ID especificada en la URL
      let filter = {}
      if (req.params.tourId) {
        filter = {tour: req.params.tourId}
      }

      // Obtener el número total de documentos en la colección
      const documentsCount = await Model.countDocuments();

      //Ejecutar el query para filtrar, ordenar, limitar y paginar los documentos
      const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate(documentsCount);

      const documents = await features.query;
  
      res.status(200).json({
        status: "success",
        results: documents.length,
        data: {
          data: documents
        }
      })

    } catch (error) {
      return next(new ErrorHandler(error, 404));
    }
  }
}