const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const CatMarker = require('../models/catégoriesmodel');
const getcatégmarkers = async (req, res, next) => {
  let markers;
  try {
    markers = await CatMarker.find(); 
  } catch (err) {
    return next(new HttpError('Fetching markers failed, try again later.', 500));
  }
  res.json({ markers: markers.map(m => m.toObject({ getters: true })) });
};
const byuserid = async (req, res, next) => {
  const userId = req.params.uid;
  let markers;
  try {
    markers = await CatMarker.find({ creator: userId });
  } catch (err) {
    return next(new HttpError('Fetching user markers failed.', 500));
  }

  if (!markers || markers.length === 0) {
    return next(new HttpError('No markers found for this user.', 404));
  }

  res.json({ markers: markers.map(m => m.toObject({ getters: true })) });
};
const newcatég = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed.', 422));
  }

  const { type, description, creator } = req.body;

  const createdMarker = new CatMarker({
    type,
    description,
    image: 'https://via.placeholder.com/400',
    creator
  });

  try {
    await createdMarker.save();
  } catch (err) {
    return next(new HttpError('Creating markercat failed, try again.', 500));
  }

  res.status(201).json({ marker: createdMarker.toObject({ getters: true }) });
};
const modifmarker = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed.', 422));
  }

  const markerId = req.params.pid;
  const { type, description } = req.body;

  let marker;
  try {
    marker = await CatMarker.findById(markerId);
  } catch (err) {
    return next(new HttpError('Could not update marker.', 500));
  }

  if (!marker) {
    return next(new HttpError('Marker not found.', 404));
  }

  marker.type = type;
  marker.description = description;

  try {
    await marker.save();
  } catch (err) {
    return next(new HttpError('Updating catmarker failed.', 500));
  }

  res.status(200).json({ marker: marker.toObject({ getters: true }) });
};
const delmarker = async (req, res, next) => {
  const markerId = req.params.pid;

  let marker;
  try {
    marker = await CatMarker.findById(markerId);
  } catch (err) {
    return next(new HttpError('Deleting catmarker failed.', 500));
  }

  if (!marker) {
    return next(new HttpError('catMarker not found.', 404));
  }

  try {
    await marker.deleteOne();
  } catch (err) {
    return next(new HttpError('Failed to delete marker.', 500));
  }

  res.status(200).json({ message: 'Deleted marker.' });
};
exports.getcatégmarkers = getcatégmarkers;
exports.newcatég = newcatég;
exports.byuserid = byuserid;
exports.delmarker = delmarker;
exports.modifmarker = modifmarker;
