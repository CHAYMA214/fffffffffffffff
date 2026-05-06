const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  markers: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Marker' }],
  reports: [{ type: mongoose.Types.ObjectId, ref: 'Report' }],
  
  // Champs pour la réinitialisation du mot de passe
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

// Plugin de validation d'unicité
userSchema.plugin(uniqueValidator);

// Méthode pour générer le token de réinitialisation
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash le token et le stocke dans le champ
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Expire dans 1 heure
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
