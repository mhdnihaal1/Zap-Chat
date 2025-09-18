import React from "react";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";

function IncomingCall() {
 const [{ IncomingVoiceCall, socket }, dispatch] = useStateProvider();
console.log("IncomingVoiceCall :",IncomingVoiceCall)

  if (!IncomingVoiceCall) return null; // prevent crash if no call

  const acceptedCall = () => {
    const call = IncomingVoiceCall;
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: { ...IncomingVoiceCall, type: "in-coming" },
    });
    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      IncomingVoiceCall: undefined,
    });
    socket.emit("accept-incoming-call", { id: IncomingVoiceCall._id });
  };

  const rejectedCall = () => {
    socket.emit("reject-voice-call", { from: IncomingVoiceCall._id });
    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={IncomingVoiceCall.profilePicture || "/default-avatar.png"}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{IncomingVoiceCall.name}</div>
        <div className="text-sm">Incoming Voice Call</div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-500 p-1 px-3 text-sm rounded-full"
            onClick={rejectedCall}
          >
            Reject
          </button>
          <button
            className="bg-green-500 p-1 px-3 text-sm rounded-full"
            onClick={acceptedCall}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
