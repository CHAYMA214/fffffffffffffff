const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Report = require('../models/report');
const User = require('../models/user');
const getReports = async (req, res, next) => {
  let reports;
  try {
    reports = await Report.find().populate('creator');
  } catch (err) {
    const error = new HttpError('Fetching reports failed, please try again later', 500);
    return next(error);
  }
  res.json({ reports });
};

const write = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed.', 422));
  }

  const { type, description, creator, lat, lng } = req.body;
  let existingReport;
  
  try {
    existingReport = await Report.findOne({ description });
  } catch (err) {
    console.error("Error checking if the report exists: ", err);
    const error = new HttpError('Could not check the report, try again later.', 500);
    return next(error);
  }

  if (existingReport) {
    return next(new HttpError('Report with this description already exists.', 422));
  }
  let user;
  try {
    user = await User.findById(creator);
    if (!user) {
      return next(new HttpError('Creator not found.', 404));
    }
  } catch (err) {
    console.error("Error finding the creator user: ", err);
    const error = new HttpError('Could not find the user, please try again later.', 500);
    return next(error);
  }

  const createdReport = new Report({
    type,
    description,
    location: { lat, lng },  
    creator
  });

  try {
    await createdReport.save();
    user.reports.push(createdReport); 
    await user.save();
  } catch (err) {
    console.error("Error saving report to database: ", err);
    return next(new HttpError('Creating report failed, try again.', 500));
  }

  res.status(201).json({ marker: createdReport.toObject({ getters: true }) });
};

exports.getReports = getReports;
exports.write = write;
