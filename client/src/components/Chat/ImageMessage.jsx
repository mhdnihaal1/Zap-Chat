import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";
import { HOST } from "@/utils/ApiRoutes";
import Image from "next/image";

function ImageMessage({ message }) {
  const [{ currentChatUser, userInfo }] = useStateProvider();

  const isSentByMe = message?.sender?._id === userInfo._id;
  const isIncoming = !isSentByMe;
   return (
    <div
      className={`p-1 rounded-lg ${
        isIncoming ? "bg-incoming-background" : "bg-outgoing-background"
      }`}
    >
      <div className="relative">
        <Image
          src={`${HOST}/${message.message}`}
          className="rounded-lg"
          alt="img"
          height={300}
          width={300}
        />
        <div className="absolute bottom-1 right-1 flex items-end gap-1">
          <span className="text-bubble--meta text-[11px] pt-1 min-w-fit">
            {calculateTime(message.createdAt)}
          </span>
          {isSentByMe && (
            <MessageStatus messageStatus={message.messageStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageMessage;
