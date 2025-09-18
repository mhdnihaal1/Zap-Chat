import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";
import connectDB from "./utils/Schemas/db.js";
import Message from "./utils/Schemas/Message.js";

dotenv.config();

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads/recordings",express.static("uploads/recordings"));
app.use("/uploads/images",express.static("uploads/images"));

app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

app.get("/", (req, res) => {
  res.send("hello");
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

const io = new Server(server,{
  cors:{
    origin: "http://localhost:5173",  
  }
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  // console.log("Socket connected:", socket.id);
    socket.on("add-user", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("online-users", {
        onlineUsers:Array.from(onlineUsers.keys()),
      })
       } else { 
      console.log("add-user called with null or undefined id");
    }
  });

  socket.on("message-seen", async ({ senderId, receiverId }) => {
  try {
     await Message.updateMany(
      { sender: senderId, reciever: receiverId, messageStatus: { $ne: "seen" } },
      { $set: { messageStatus: "seen" } }
    );

     const senderSocket = onlineUsers.get(senderId);
    if (senderSocket) {
      socket.to(senderSocket).emit("message-seen-update", { receiverId });
    }
  } catch (err) {
    console.error("Error updating seen messages:", err);
  }
});


  socket.on("signout", (id) => {
     onlineUsers.delete(id);
    console.log("reciever here for signout")
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });
 
   socket.on("send-msg", (data) => { 
     const sendUserSocket = onlineUsers.get(data?.to);
    
      if (sendUserSocket) {
       socket.to(sendUserSocket).emit("msg-recieve", {
        from: data.message?.sender?._id,
        message: data.message,
      });
      } else {
      console.log("User is offline or socket not registered:", data.to);
    }
  });

  socket.on("outgoing-voice-call",(data) => {
    const sendUserSocket = onlineUsers.get(data.to);
        console.log("outgoing-voice-call",data ,sendUserSocket)
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("incoming-voice-call",{
        from:data.from,
        roomId: data.roomId,
        callType:data.callType,

      })
    }
  });

  socket.on("outgoing-video-call",(data) => {
    const sendUserSocket = onlineUsers.get(data.to);
        console.log("outgoing-video-call",data ,sendUserSocket)
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("incoming-video-call",{
        from:data.from,
        roomId: data.roomId,
        callType:data.callType,

      })
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("voice-call-rejected")
    }
  })

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("video-call-rejected")
    }
  })



  socket.on("accept-incoming-call",((id) => {
    const sendUserSocket = onlineUsers.get(id);
    socket.to(sendUserSocket).emit("accept-call")
  }))
});
