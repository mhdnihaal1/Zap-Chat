import React from "react";
import { BsCheck } from "react-icons/bs";
import { BsCheck2, BsCheck2All } from "react-icons/bs";

function MessageStatus({ messageStatus }) {
   return (
    <>
      {messageStatus === "sent" && <BsCheck2 className="text-sm" /> }
      {messageStatus === "delivered" && (
        <span className="flex">
          <BsCheck2All className="text-sm" />
         </span>
      )}
      {messageStatus === "read" && (
        <span className="flex text-blue-500">
          <BsCheck2All className="text-sm text-blue-500" />

        </span>
      )}
    </>
  );
}

export default MessageStatus;
