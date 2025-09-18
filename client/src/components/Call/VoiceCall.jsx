import { useStateProvider } from "@/context/StateContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
const Container = dynamic(() => import("./Container"), { ssr: false });

function VoiceCall() {
  const [{ voiceCall, socket, userInfo }] = useStateProvider();
   
  useEffect(() => {
if(voiceCall.type === "out-going") {
  alert("sending event")
  socket.emit("outgoing-voice-call" ,{
    to: voiceCall._id,
    from: {
      id: voiceCall._id,
      profilePicture: userInfo.profilePicture,
      name: userInfo.name
    },
    callType: voiceCall.callType,
    roomId: voiceCall.roomId,
  })
}
  },[voiceCall])
  return <Container data={voiceCall} />;
}

export default VoiceCall;
