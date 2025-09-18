import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import Chat from "./Chat/Chat";
import axios from "axios";
import { GET_MESSAGE_ROUTE, CHECK_USER_ROUTE, HOST } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";

function Main() {
  const router = useRouter();
  const [
    {
      userInfo,
      currentChatUser,
      socket,
      messagesSearch,
      videoCall,
      voiceCall,
      incomingVoiceCall,
      incomingVideoCall,
    },
    dispatch,
  ] = useStateProvider();
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [socketEvent, setSocketEvent] = useState(false);
  // useEffect(() => {
  //     if (redirectLogin) router.push("/login");
  // }, [redirectLogin]);

  onAuthStateChanged(firebaseAuth, async (currentUser) => {
    if (!currentUser) setRedirectLogin(true);
    if (!userInfo && currentUser?.email) {
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/check-user `,
        {
          email: currentUser.email,
        }
      );

      if (data.status) {
        router.push("/");
      }
      if (data?.data) {
        const { _id, name, email, profileImage, about } = data?.data;
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            _id,
            name,
            email,
            profileImage: data?.data?.profilePicture || "/default_avatar.png",
            about,
          },
        });
      }
    }
  });

  useEffect(() => {
    const setupSocket = async () => {
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/check-user `,
        {
          email: userInfo?.email,
        }
      );
      if (!data?.data?._id) return;
      const s = io(HOST, {
  transports: ["websocket"], 
});
     
      s.emit("add-user", data.data._id);

      dispatch({ type: reducerCases.SET_SOCKET, socket: s });
    };

    setupSocket();
  }, [userInfo]);

useEffect(() => {
  if (!socket) return;

  const handler = (message) => {
    if (message.from === currentChatUser?._id) {
       dispatch({ type: reducerCases.ADD_MESSAGE, newMessage: message.message });
    }
  };

  socket.on("msg-recieve", handler);

  socket.on("incoming-voice-call", ({ from, roomId, callType }) => {
    console.log("incoming-voice-call",from, roomId, callType )
    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: { ...from, roomId, callType },
    });
  });

  socket.on("incoming-video-call", ({ from, roomId, callType }) => {
    console.log("incoming-video-call",from, roomId, callType )
    dispatch({
      type: reducerCases.SET_INCOMING_VIDEO_CALL,
      incomingVideoCall: { ...from, roomId, callType },
    });
  });

  socket.on("voice-call-rejected", () => {
    dispatch({ type: reducerCases.END_CALL });
  });

  socket.on("video-call-rejected", () => {
    dispatch({ type: reducerCases.END_CALL });
  });

  socket.on("online-users", ({ onlineUsers }) => {
        console.log("reciever here for signout 222")

    dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
  });

   
 socket.on("message-seen-update", async () => {
    try {
      console.log(122333)
      let email = userInfo?.email;
      if (!email || !currentChatUser?._id) return;

       const res = await axios.post("http://localhost:5000/api/auth/check-user", { email });
      let userId = res?.data?.data?._id;

       const { data } = await axios.get(`${GET_MESSAGE_ROUTE}/${userId}/${currentChatUser._id}`);
         const {
                 data: { users, onlineUsers },
               } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo._id}`);
               // console.log("on list page 2:", users, onlineUsers);
        console.log(12341234,users,onlineUsers)
       
               dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
               dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
console.log(1111111111,data)
       dispatch({ type: reducerCases.SET_MESSAGES, messages: data?.messages });
    } catch (error) {
      console.error("Error updating messages after seen-update:", error);
    }
  });
  
  setSocketEvent(true);

  return () => {
    socket.off("msg-recieve", handler);
    socket.off("incoming-voice-call");
    socket.off("incoming-video-call");
    socket.off("voice-call-rejected");
    socket.off("video-call-rejected");
    socket.off("online-users");
    socket.off("message-seen-update");
    socket.off("message-seen-update");
  };
}, [socket,  currentChatUser?._id, dispatch]);
 

useEffect(() => {
  const getMessages = async () => {
    try {
      let email = userInfo?.email;
      if (!email || !currentChatUser?._id) return;

      const res = await axios.post("http://localhost:5000/api/auth/check-user", { email });
      let userId = res?.data?.data?._id;

      const { data } = await axios.get(`${GET_MESSAGE_ROUTE}/${userId}/${currentChatUser._id}`);
 
      dispatch({ type: reducerCases.SET_MESSAGES, messages: data?.messages });
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  getMessages();
}, [userInfo?._id, currentChatUser?._id, dispatch]);


  return (
    <>

{incomingVideoCall && <IncomingVideoCall />}
{incomingVoiceCall && <IncomingCall />}

      {videoCall && (
        <div className="h-screen max-h-full over-flow-hidden">
          <VideoCall />
        </div>
      )}
      {voiceCall && (
        <div className="h-screen max-h-full over-flow-hidden">
          <VoiceCall />
        </div>
      )}
      {!videoCall && !voiceCall && (
        <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden">
          <ChatList />
          {currentChatUser ? (
            <div
              className={messagesSearch ? `grid grid-cols-2` : `grid-cols-2`}
            >
              <Chat />
              {messagesSearch && <SearchMessages />}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </>
  );
}

export default Main;
