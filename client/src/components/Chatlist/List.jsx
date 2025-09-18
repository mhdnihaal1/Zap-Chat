import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import React, { useEffect } from "react";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import ChatListItem from "./ChatListItem";
import { reducerCases } from "@/context/constants";

function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] =
    useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users, onlineUsers },
        } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo._id}`);
        // console.log("on list page 2:", users, onlineUsers);
        // console.log(12341234,users,onlineUsers)

        dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
        dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
      } catch (error) {
        console.log(error);
      }
    };

    if (userInfo?._id) getContacts();
  }, [userInfo]);
  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts.map((contact) => (
            <ChatListItem data={contact} key={contact._id} />
          ))
        : userContacts.map((contact, index) => (
            <ChatListItem data={contact} key={contact._id} />
          ))}
    </div>
  );
}

export default List;
