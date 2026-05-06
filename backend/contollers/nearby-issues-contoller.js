const { validationResult } = require('express-validator');
const Report = require('../models/report');
const uuidv4 = require('uuid').v4;

const location = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs.', 422));
  }

  const { lat, log } = req.body;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(log);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(new HttpError('Invalid coordinates.', 422));
  }

  try {
    const nearbyReport = await Report.findOne({
      'location.lat': { $gte: latitude - 0.001, $lte: latitude + 0.001 },
      'location.log': { $gte: longitude - 0.001, $lte: longitude + 0.001 }
    });

    if (nearbyReport) {
      return next(new HttpError('Nearby issue already exists.', 422));
    }

    const newEntry = {
      id: uuidv4(),
      lat: latitude,
      log: longitude
    };
    res.status(201).json({ message: 'No nearby issues found.', location: newEntry });
  } catch (err) {
    console.error('DB error during nearby check:', err);
    return next(new HttpError('Checking nearby issues failed.', 500));
  }
};

exports.location = location;
