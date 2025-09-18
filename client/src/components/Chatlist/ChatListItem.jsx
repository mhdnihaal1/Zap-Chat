import React, { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import MessageStatus from "../common/MessageStatus";
import { FaCamera, FaMicrophone } from "react-icons/fa";
import { calculateTime } from "@/utils/CalculateTime";
import axios, { all } from "axios";

function ChatListItem({ data, isContactPage = false }) {
  const [{ userInfo, currentChatUser }, dispatch] = useStateProvider();
  const [user, setUsers] = useState([]);

  useEffect(() => {
  const getContacts = () => {
    try {
      const filteredUsers = (Array.isArray(data) ? data : [data])
        .map((chat) => {
          if (String(chat.sender?._id) === String(userInfo._id)) {
            return chat.reciever;
          } else if (String(chat.reciever?._id) === String(userInfo._id)) {
            return chat.sender;
          }
          return null;
        })
        .filter(Boolean);

      setUsers(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  };
  getContacts();
}, [data, userInfo._id]);


   const handleContactClick = () => {
    let selectedUser;
    if (!isContactPage) {
       const isSender = userInfo._id === data?.sender?._id;
      const targetUser = isSender ? data.reciever : data.sender;

      selectedUser = {
        _id: targetUser._id,
        name: targetUser.name,
        about: targetUser.about,
        profilePicture: targetUser.profilePicture,
        email: targetUser.email,
      };
    } else {
 
      selectedUser = {
        _id: data._id,
        name: data.name,
        about: data.about,
        profilePicture: data.profilePicture,
        email: data.email,
      };
      dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE, payload: false });
      //  if (selectedUser._id === data._id) {
      //   dispatch({
      //     type: reducerCases.SET_USER_CONTACTS,
      //     userContacts: [...userContacts, selectedUser],
      //   });
      // }
    }
 
    dispatch({
      type: reducerCases.CHANGE_CURRENT_CHAT_USER,
      user: selectedUser,
    });
  };

  return (
    <div
      className={`flex cursor-pointer items-center hover:bg-background-default-hover`}
      onClick={handleContactClick}
    >
      <div className="min-w-fit px-5 pt-3 pb-1 ">
        <Avatar
          type="lg"
          image={
            data.sender
              ? data?.sender?._id !== userInfo._id
                ? data?.sender?.profilePicture
                : data?.reciever?.profilePicture
              : data.profilePicture
          }
        />
      </div>
      <div className="min-h-full flex flex-col justify-center mt-3 pr-2 w-full">
        <div className="flex justify-between">
          <div>
            <span className="text-white">
              {data.sender
                ? data?.sender?._id !== userInfo._id
                  ? data?.sender?.name
                  : data?.reciever?.name
                : data?.name}
            </span>
          </div>
          {!isContactPage && (
            <div>
              <span
                className={`${
                  data.sender.totalUnreadMessages > 0
                    ? "text-secondary "
                    : "text-icon-green"
                } text-sm`}
              >
                {data.createdAt ? calculateTime(data.createdAt) : ""}
              </span>
            </div>
          )}
        </div>
        <div className="flex border-b border-conversation-border pb-2 pt-1 pr-2">
          <div className="flex justify-between w-full ">
            <span className="text-secondary line-clamp-1 text-sm">
              {isContactPage ? (
                data?.sender?.about || "\u00A0"
              ) : (
                <div className="flex items-center gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]">
                   {data.sender?._id === userInfo._id && (
                    <MessageStatus messageStatus={data?.messageStatus} />
                  )}
                  {data.type === "text" && (
                    <span className="truncate">{data.message}</span>
                  )}
                   {data.type === "audio" && (
                    <span className="flex gap-1 items-center">
                      <FaMicrophone className="text-panel-header-icon" />
                    </span>
                  )}
                  {data.type === "image" && (
                    <span className="flex gap-1 items-center">
                      <FaCamera className="text-panel-header-icon" />
                    </span>
                  )}
                </div>
              )}
            </span>
            {data.totalUnreadMessages > 0 && (
              <span className="bg-icon-green px-[10px] rounded-full text-sm">
                {data.totalUnreadMessages}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
