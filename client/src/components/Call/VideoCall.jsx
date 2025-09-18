import { useStateProvider } from "@/context/StateContext";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
const Container = dynamic(() => import("./Container"), { ssr: false });

function VideoCall() {
  const [{ videoCall, socket, userInfo }] = useStateProvider();
   useEffect(() => {
    if (videoCall.type === "out-going") {
      alert("sending event");
      socket.emit("outgoing-video-call", {
        to: videoCall._id,
        from: {
          id: videoCall._id,
          profilePicture: userInfo.profilePicture,
          name: userInfo.name,
        },
        callType: videoCall.callType,
        roomId: videoCall.roomId,
      });
    }
  }, [videoCall]);

  return <Container data={videoCall} />;
}

export default VideoCall;
