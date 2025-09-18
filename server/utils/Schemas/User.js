import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  about: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
