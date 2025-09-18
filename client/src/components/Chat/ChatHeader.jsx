import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";

function ChatHeader() {
  const [{ currentChatUser ,onlineUsers}, dispatch] = useStateProvider();
   const [ contextMenuCordinates, setContextMenuCordinates] = useState({
    x:0,
    y:0
  });
  const [ isContextMenuVisible, setIsContextVisible] = useState(false);
  console.log("inshallah 123",onlineUsers)
  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX - 50, y: e.pageY + 20 });
    setIsContextVisible(true);
  };

  const contextMenuOptions = [
    {
      name: "Exit",
      callback: async() => {
        setIsContextVisible(false);
        dispatch({type: reducerCases.SET_EXIT_CHAT})
      }
    }
  ]

  const handleVoiceCall = () => {
    console.log("on chat header 1 handleVoiceCall:",currentChatUser)
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };

  const handleVideoCall = () => {
    console.log("on chat header 2 handleVideoCall:",currentChatUser)

    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };
  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background border-l-[1px] border-black z-10">
      <div className="flex items-center justify-center gap-6">
        <Avatar
          type="sm"
          image={currentChatUser?.profilePicture || "/default_avatar.png"}
        />
        <div className="flex flex-col">
          <span className="text-primary-strong ">
            {currentChatUser?.name || "Demo"}
          </span>
          <span className="text-secondary text-sm">
            {
              onlineUsers.includes(currentChatUser._id) ? "online" : "offline"
            }
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <MdCall
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={handleVoiceCall}
        />
        <IoVideocam
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={handleVideoCall}
        />
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={() => dispatch({ type: reducerCases.SET_MESSAGE_SEARCH })}
        />
        <FiMoreVertical className="text-panel-header-icon cursor-pointer text-xl"
        onClick={(e) => showContextMenu(e)} 
        id="context-opener"/>
        {isContextMenuVisible && (
          <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCordinates}
          contextmenu={isContextMenuVisible}
          setContextmenu={setIsContextVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
