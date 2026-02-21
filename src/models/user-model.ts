import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
  activationExpires: { type: Date },
  favorites: { type: [String], default: [] },
  name: { type: String, required: true }
});

export default model('User', UserSchema);