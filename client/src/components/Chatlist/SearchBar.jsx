import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState } from "react";
import { BsFilter } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import axios from "axios";

function SearchBar() {
  const [{ userInfo ,userContacts }, dispatch] = useStateProvider();
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
 
  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users },
        } = await axios.get(`http://localhost:5000/api/auth/get-contacts`, {
          params: { email: userInfo?.email },
        });
        setAllContacts(users);
        setFilteredContacts(users);  
      } catch (error) {
        console.log(error);
      }
    };
    getContacts();
  }, [userInfo]);

   useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(allContacts);
    } else {
      const filtered = {};
      Object.keys(allContacts).forEach((key) => {
        filtered[key] = allContacts[key].filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredContacts(filtered);
    }

     dispatch({
      type: reducerCases.SET_CONTACT_SEARCH,
      contactSearch: searchTerm,
    });
  }, [searchTerm, allContacts, dispatch]);

  return (
    <div className="bg-search-input-container-background flex py-3 pl-5 items-center gap-3 h-14">
      <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow">
        <FiSearch className="text-panel-header-icon cursor-pointer text-lg" />
        <input
          type="text"
          placeholder="Search or start a new chat"
          className="bg-transparent text-sm focus:outline-none text-white w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="pr-5 pl-3">
        <BsFilter className="text-panel-header-icon cursor-pointer text-lg" />
      </div>
    </div>
  );
}

export default SearchBar;
