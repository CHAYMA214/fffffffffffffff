const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Marker = require('../models/marker');
const User = require('../models/user');
const getAllMarkers = async (req, res, next) => {
  let markers;
  try {
    markers = await Marker.find({});
  } catch (err) {
    return next(new HttpError('Fetching all markers failed.', 500));
  }

  res.json({
    markers: markers.map(marker => marker.toObject({ getters: true }))
  });
};

const byid = async (req, res, next) => {
  const markerId = req.params.pid;

  let marker;
  try {
    marker = await Marker.findById(markerId);  
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a marker.',
      500
    );
    return next(error);
  }

  if (!marker) {
    const error = new HttpError(
      'Could not find a marker for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ marker: marker.toObject({ getters: true }) });
};

const byuserid = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithMarkers;

  try {
    userWithMarkers = await User.findById(userId).populate('markers');
  } catch (err) {
    const error = new HttpError(
      'Fetching markers failed, please try again later',
      500
    );
    return next(error);
  }

  // Vérifie si l'utilisateur existe et a des marqueurs
  if (!userWithMarkers || userWithMarkers.markers.length === 0) {
    return next(
      new HttpError('Could not find markers for the provided user id.', 404)
    );
  }

  res.json({
    markers: userWithMarkers.markers.map(place => place.toObject({ getters: true })),
  });
};

const newmarker = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const { type, description, address, creator,image } = req.body;
  let coordinates;
  try {
    console.log('Attempting to get coordinates for address:', address);
    coordinates = await getCoordsForAddress(address);
    console.log('Coordinates obtained:', coordinates);
  } catch (error) {
    console.log('Error while getting coordinates:', error);
    return next(error);
  }
  const createdMarker = new Marker({
    type,
    description,
    address,
    location: coordinates,
    image,
    creator
  });
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    console.error('Erreur lors de la recherche de l\'utilisateur :', err);
    return next(new HttpError('Creating marker failed, please try again.', 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdMarker.save({ session: sess });
    user.markers.push(createdMarker);
    await user.save({ session: sess });
    await sess.commitTransaction();
    console.log('Marker et utilisateur enregistrés avec succès.');
  } catch (err) {
    console.error('Erreur lors de la création du marker :', err);
    return next(new HttpError('Creating marker failed, please try again.', 500));
  }

  res.status(201).json({ marker: createdMarker.toObject({ getters: true }) });
};


const modifmarker = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { type, description } = req.body;
  const markerId = req.params.pid;

  let marker;
  try {
    marker = await Marker.findById(markerId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update marker.',
      500
    );
    return next(error);
  }

  marker.type = type;
  marker.description = description;

  try {
    await marker.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update marker.',
      500
    );
    return next(error);
  }

  res.status(200).json({ marker: marker.toObject({ getters: true }) });
};

const delmarker = async (req, res, next) => {
  const markerId = req.params.pid;

  let marker;
  try {
    marker = await Marker.findById(markerId).populate('creator');
  } catch (err) {
    console.error(err);
    return next(new HttpError('Something went wrong, could not delete marker.', 500));
  }

  if (!marker) {
    return next(new HttpError('Could not find marker for this id.', 404));
  }

  if (!marker.creator) {
    return next(new HttpError('Could not find creator for this marker.', 500));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Marker.deleteOne({ _id: marker._id }).session(sess);
    marker.creator.markers.pull(marker._id);
    await marker.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Something went wrong, could not delete marker.', 500));
  }

  res.status(200).json({ message: 'Deleted marker.' });
};

exports.byid = byid;
exports.newmarker = newmarker;
exports.byuserid = byuserid;
exports.delmarker = delmarker;
exports.modifmarker = modifmarker;
exports.getAllMarkers = getAllMarkers;

