import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useState } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import axios from "axios";
import dynamic from "next/dynamic";
const VoiceMessage = dynamic(() => import("./VoiceMessage"), {
  ssr: false,
});

function ChatContainer() {
  const [{ messages, currentChatUser, userInfo ,socket}, dispatch] =
    useStateProvider();
  const [userid, setUserId] = useState("");


  useEffect(() => {
  if (!currentChatUser?._id || !userInfo?._id) return;

   socket.emit("message-seen", {
    senderId: currentChatUser._id, // opponent
    receiverId: userInfo._id,      // me
  });
}, [currentChatUser?._id, userInfo?._id]);


   useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (!userInfo?.email) return;
        const res = await axios.post(
          "http://localhost:5000/api/auth/check-user",
          { email: userInfo.email }
        );
        setUserId(res.data.data._id);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserId();
  }, []);

  if (!userid) {
    return null;
  }

  return (
    <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
      <div className="bg-chat-background bg-fixed h-full w-full opacity-[0.05] fixed left-0 top-0 z-0"></div>

      <div className="mx-10 my-6 relative bottom-0 z-40 left-0">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
            {messages.map((message, index) => {
              const isSentByMe =
                String(message?.sender?._id) === String(userInfo?._id);
              const isIncoming = !isSentByMe;

              return (
                <div
                  key={message?._id?.toString() || index}
                  className={`flex ${
                    isIncoming ? "justify-start" : "justify-end"
                  }`}
                 >
                  
                  {message?.type === "text" && (
                    <div
                      className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[80%] sm:max-w-[60%] lg:max-w-[45%] ${
                        isIncoming
                          ? "bg-incoming-background"
                          : "bg-outgoing-background"
                      }`}
                    >
                      <span className="break-words">{message.message}</span>
                      <div className="flex gap-1 items-end">
                        <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                          {calculateTime(message.createdAt)}
                        </span>
                        {isSentByMe && (
                          <MessageStatus
                            messageStatus={message.messageStatus}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {message?.type === "image" && (
                    <ImageMessage message={message} />
                  )}
                  {message?.type === "audio" && (
                    <VoiceMessage message={message} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
