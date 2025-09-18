import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { FaMicrophone } from "react-icons/fa";
import dynamic from "next/dynamic";
const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
  ssr: false,
});

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const photoPickerChange = async (e) => {
    try {
      let email = userInfo?.email;
      let res = await axios.post(`http://localhost:5000/api/auth/check-user`, {
        email,
      });
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);
 
      const { data } = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: res?.data?.data?._id,
          to: currentChatUser._id,
        },
      });
 
       if (data?.populatedMessage) {
        
        
        if (socket ) {
          socket.emit("send-msg", {
            to: currentChatUser._id,
            from: res?.data?.data?._id,
            message: data.populatedMessage,
          });
        }
         dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: { ...data.populatedMessage },
          fromSelf: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => (prevMessage += emoji.emoji));
  };

  const sendMessage = async () => {
    try {
      let email = userInfo?.email;
      let res = await axios.post(`http://localhost:5000/api/auth/check-user`, {
        email,
      });
      if (!message || message.trim() === "") {
        alert("Please type a message before sending.");
        return;
      }

      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        from: res?.data?.data?._id,
        to: currentChatUser?._id,
        message,
      });
 
       if (socket) {
         socket.emit("send-msg", {
          to: currentChatUser?._id,
          from: data.message?.sender?._id,
          message: data?.populatedMessage,
        });
      }
       dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...data.populatedMessage,
        },
        fromSelf: true,
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      if (data) data.click();
      document.body.onfocus = () => {
        setTimeout(() => setGrabPhoto(false), 1000);
      };
    }
  }, [grabPhoto]);
  return (
    <div className="bg-panel-header-background h-20 px-4 flex items-center gap-4 relative">
      {!showAudioRecorder && (
        <>
          <div className="flex gap-6 relative">
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Emoji"
              id="emoji-open"
              onClick={handleEmojiModal}
            />
            {showEmojiPicker && (
              <div
                className="absolute bottom-24 left-16 z-40"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
            <ImAttachment
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Attach File"
              onClick={() => setGrabPhoto(true)}
            />
          </div>
          <div className="w-full rounded-lg h-10 flex items-center">
            <input
              type="text"
              placeholder="Type a message"
              className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
          </div>
          <div className="flex w-16 items-center justify-between space-x-2">
            {message?.length ? (
              <MdSend
                className="text-panel-header-icon cursor-pointer text-xl"
                onClick={sendMessage}
                title="Send Message"
              />
            ) : (
              <FaMicrophone
                className="text-panel-header-icon cursor-pointer text-xl"
                title="Record"
                onClick={() => setShowAudioRecorder(true)}
              />
            )}
          </div>
        </>
      )}

      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
      {showAudioRecorder && <CaptureAudio Hide={setShowAudioRecorder} />}
    </div>
  );
}

export default MessageBar;
