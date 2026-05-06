
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reportSchema = new Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
  ,
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Report', reportSchema);
