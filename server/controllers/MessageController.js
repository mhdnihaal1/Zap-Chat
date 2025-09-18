import Message from "../utils/Schemas/Message.js";
import User from "../utils/Schemas/User.js";
import { renameSync } from "fs";
import mongoose from "mongoose";

export const addMessage = async (req, res, next) => {
  try {
    console.log("Add-message");
    const { message, from, to } = req.body;
    const getuser = onlineUsers.get(to);

    if (message && from && to) {
      const newMessage = await Message.create({
        message,
        sender: from,
        reciever: to,
        messageStatus: getuser ? "delivered" : "sent",
      });

      const populatedMessage = await newMessage.populate([
        "sender",
        "reciever",
      ]);
      return res.status(201).send({ populatedMessage });
    }
    return res.status(400).send("Form,to and Message is required.");
  } catch (error) {
    console.log(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    console.log("get-message");

    const { from, to } = req.params;
 
    const messages = await Message.find({
      $or: [
        {
          sender: new mongoose.Types.ObjectId(from),
          reciever: new mongoose.Types.ObjectId(to),
        },
        {
          sender: new mongoose.Types.ObjectId(to),
          reciever: new mongoose.Types.ObjectId(from),
        },
      ],
    }).sort({ _id: 1 }).populate([
        "sender",
        "reciever",
      ]);
 
 
    const unreadMessages = [];
    messages.forEach((message, index) => {
       if (
        message?.messageStatus !== "read" &&
        message?.sender?._id == to
      ) {
     message.messageStatus = "read";
     unreadMessages.push(message._id);
      }
    });
    if (unreadMessages.length > 0) { 
      await Message.updateMany(
        { _id: { $in: unreadMessages } },
        { $set: { messageStatus: "read" } }
      );
    }
    res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    console.log("Add-Image-Message");

    if (req.file) {
       const date = Date.now();
      let fileName = "uploads/images/" + date + req.file.originalname;
      renameSync(req.file?.path, fileName);
      const { from, to } = req.query;

      if (from && to) {
        const newMessage = await Message.create({
          message: fileName,
          sender: new mongoose.Types.ObjectId(from),
          reciever: new mongoose.Types.ObjectId(to), // ensure spelling matches your schema
          type: "image",
        });
        const populatedMessage = await newMessage.populate([
        "sender",
        "reciever",
      ]);
        return res.status(201).json({ populatedMessage });
      }
      return res.status(400).send("From,to is required.");
    }
    return res.status(400).send("Image is required.");
  } catch (error) {
    console.log(error);
  }
};

export const addAudioMessage = async (req, res, next) => {
  try {
      console.log("add-Audio-Message");
    
    if (req.file) {
       const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file?.path, fileName);
      const { from, to } = req.query;

      if (from && to) {
        const newMessage = await Message.create({
          message: fileName,
          sender: new mongoose.Types.ObjectId(from),
          reciever: new mongoose.Types.ObjectId(to), // ensure spelling matches your schema
          type: "audio",
        });
         const populatedMessage = await newMessage.populate([
        "sender",
        "reciever",
      ]);
        return res.status(201).json({ populatedMessage });
      }
      return res.status(400).send("From,to is required.");
    }
    return res.status(400).send("Audio is required.");
  } catch (error) {
    console.log(error);
  }
};

 
export const getInitialContactsWithMessages = async (req, res, next) => {
  try {
    const userId = req.params.from;

    const result = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { reciever: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 }} ,

       {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      { $unwind: "$senderDetails" },

       {
        $lookup: {
          from: "users",
          localField: "reciever",
          foreignField: "_id",
          as: "recieverDetails",
        },
      },
      { $unwind: "$recieverDetails" },

      {
        $project: {
          _id: 1,
          type: 1,
          message: 1,
          messageStatus: 1,
          createdAt: 1,
          sender: {
            _id: "$senderDetails._id",
            name: "$senderDetails.name",
            email: "$senderDetails.email",
            profilePicture: "$senderDetails.profilePicture",
            about: "$senderDetails.about",
          },
          reciever: {
            _id: "$recieverDetails._id",
            name: "$recieverDetails.name",
            email: "$recieverDetails.email",
            profilePicture: "$recieverDetails.profilePicture",
            about: "$recieverDetails.about",
          },
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ msg: "No messages found" });
    }

    const users = new Map();
    const messageStatusChange = [];

        // console.log("on controller result:",result)


    result.forEach((msg) => {
      const isSender = msg.sender._id.toString() === userId.toString();
      const partnerId = isSender
        ? msg.reciever._id.toString()
        : msg.sender._id.toString();

       if (msg.messageStatus === "sent") {
        messageStatusChange.push(msg._id);
      }
        // console.log("on controller:",msg)

      if (!users.has(partnerId)) {
        let contactData = {
          messageId: msg._id,
          type: msg.type,
          message: msg.message,
          messageStatus: msg.messageStatus,
          createdAt: msg.createdAt,
          sender: msg.sender,
          reciever: msg.reciever,
          totalUnreadMessages:
          !isSender && msg.messageStatus !== "read" ? 1 : 0,
        };
        // console.log("on controller:",contactData)

        users.set(partnerId, contactData);
      } else if (!isSender && msg.messageStatus !== "read") {
         const existing = users.get(partnerId);
        users.set(partnerId, {
          ...existing,
          totalUnreadMessages: existing.totalUnreadMessages + 1,
        });
      }
    });

    // console.log(result)

     if (messageStatusChange.length > 0) {
      await Message.updateMany(
        { _id: { $in: messageStatusChange } },
        { $set: { messageStatus: "delivered" } }
      );
    }

    return res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: Array.from(global.onlineUsers?.keys() || []),
    });
  } catch (error) {
    console.log("getInitialContactsWithMessages error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
