import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reciever: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, default: "text" },
  message: { type: String, required: true },
  messageStatus: { type: String, default: "sent" },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

export default mongoose.model("Message", messageSchema);
