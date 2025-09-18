import { useStateProvider } from "@/context/StateContext";
import React from "react";
import Image from "next/image";
import { reducerCases } from "@/context/constants";
import IncomingCall from "./IncomingCall";

 function IncomingVideoCall() {
  const [{ IncomingVideoCall, socket }, dispatch] = useStateProvider();
console.log("IncomingVideoCall :",IncomingVideoCall)

  if (!IncomingVideoCall) return null; // prevent crash if no call

  const acceptedCall = () => {
    const call = IncomingVideoCall;
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: { ...IncomingVideoCall, type: "in-coming" },
    });
    dispatch({
      type: reducerCases.SET_INCOMING_VIDEO_CALL,
      IncomingVideoCall: undefined,
    });
    console.log("incoming vedio call",IncomingVideoCall )
    socket.emit("accept-incoming-call", { id: IncomingVideoCall._id });
  };

  const rejectedCall = () => {
    socket.emit("reject-video-call", { from: IncomingVideoCall._id });
    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={IncomingVideoCall.profilePicture}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{IncomingVideoCall}</div>
        <div className="text-sm">Incoming Video Call</div>
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
}

export default IncomingVideoCall;
