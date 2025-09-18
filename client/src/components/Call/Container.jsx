import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import axios from "axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdOutlineCallEnd } from "react-icons/md";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);

  useEffect(() => {
    if (data.type === "out-going")
      socket.on("accept-call", () => setCallAccepted(true));
    else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { token: returnedToken },
        } = await axios.post(`http://localhost:5000/api/auth/generate-token`, {
          userId: userInfo._id,
        });
        setToken(returnedToken);
      } catch (error) {
        console.log(error);
      }
    };
    getToken();
  }, [callAccepted]);

  useEffect(() => {
    const startCall = async () => {
      import("zego-express-engine-webrtc").then(
        async ({ ZegoExpressEngine }) => {
          const zg = new ZegoExpressEngine(
            process.env.NEXT_PUBLIC_ZEGO_APP_ID,
            process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
          );
          setZgVar(zg);

          zg.on(
            "roomStreamUpdate",
            async (roomID, updateType, streamList, extendedData) => {
              if (updateType === "ADD") {
                const rmVideo = document.getElementById("remote-video");
                const vd = document.createElement(
                  data.callType === "video" ? "video" : "audio"
                );
                vd.id = streamList[0].streamID;
                vd.autoplay = true;
                vd.playsInline = true;
                vd.muted = false;
                if (rmVideo) {
                  rmVideo.appendChild(vd);
                }
                zg.startPlayingStream(streamList[0].streamID, {
                  audio: true,
                  video: true,
                }).then((stream) => (vd.srcObject = stream));
              } else if (
                updateType === "DELETE" &&
                zg &&
                localStream &&
                streamList[0].streamID
              ) {
                zg.destroyStream(localStream);
                zg.stopPublishingStream(streamList[0].streamID);
                zg.logoutRoom(data.roomId.toString());
                dispatch({ type: reducerCases.END_CALL });
              }
            }
          );
          await zg.loginRoom(
            data.roomId.toString(),
            token,
            {
              userID: userInfo?._id?.toString() || `guest_${Date.now()}`,
              userName: userInfo?.name || "Guest",
            },
            { userUpdate: true }
          );

          const localStream = await zg.createStream({
            camera: {
              audio: true,
              video: data.callType === "video" ? true : false,
            },
          });
          if (!localStream || localStream.getTracks().length === 0) {
            console.error("No tracks in localStream!");
            return;
          }
          const localVideo = document.getElementById("local-audio");
          const videoElement = document.createElement(
            data.callType === "video" ? "video" : "audio"
          );
          videoElement.id = "video-local-zego";
          videoElement.className = "h-28 w-32";
          videoElement.autoplay = true;
          videoElement.muted = false;
          videoElement.playsInline = true;

          localVideo.appendChild(videoElement);
          const id = document.getElementById("video-local-zego");
          id.srcObject = localStream;
          const streamID = "123" + Date.now();
          setPublishStream(streamID);
          setLocalStream(localStream);
          zg.startPublishingStream(streamID, localStream);
        }
      );
    };
    if (token) {
       startCall();
    }
  }, [token]);

  const endCall = () => {
    const id = data.id;
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }
    if (data.callType === "voice") {
      socket.emit("reject-voice-call", {
        from: id,
      });
    } else {
      socket.emit("reject-video-call", {
        from: id,
      });
    }

    dispatch({ type: reducerCases.END_CALL });
  };
  return (
    <div className="w-full h-[100vh] bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* -------- VIDEO CALL -------- */}

      {callAccepted && data.callType == "video" ? (
        <>
          <div
            id="remote-video"
            className="absolute inset-0 w-full h-full z-10"
          ></div>
          <div
            id="local-audio"
            className="absolute bottom-24 right-5 w-36 h-36 rounded-lg overflow-hidden shadow-lg border border-white/20 z-20"
          ></div>

          {/* Overlay Call Info */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20">
            <span className="text-2xl font-semibold drop-shadow">
              {data.name}
            </span>
            <span className="text-sm text-gray-300 italic">
              {callAccepted ? "Ongoing video call..." : "Calling..."}
            </span>
          </div>
          {/* Profile Picture */}
          {callAccepted ? (
            <></>
          ) : (
            <div className="my-16 animate-pulse">
              <Image
                src={data.profilePicture}
                alt="avatar"
                width={250}
                height={250}
                className="rounded-full shadow-2xl border-4 border-white/20"
              />
            </div>
          )}
        </>
      ) : (
        /* -------- AUDIO CALL -------- */
        <>
          {/* User Info */}
          <div className="flex flex-col gap-3 items-center z-10">
            <span className="text-4xl font-bold tracking-wide drop-shadow-lg">
              {data.name}
            </span>
            <span className="text-lg text-gray-300 italic">
              {callAccepted ? "Ongoing call..." : "Calling..."}
            </span>
          </div>

          {/* Profile Picture */}
          <div className="my-16 animate-pulse">
            <Image
              src={data.profilePicture}
              alt="avatar"
              width={250}
              height={250}
              className="rounded-full shadow-2xl border-4 border-white/20"
            />
          </div>
        </>
      )}

      {/* -------- END CALL BUTTON -------- */}
      <div className="absolute bottom-12 flex items-center justify-center z-30">
        <div
          className="h-20 w-20 bg-red-600 flex items-center justify-center rounded-full shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
          onClick={endCall}
        >
          <MdOutlineCallEnd className="text-4xl" />
        </div>
      </div>
    </div>
  );
}

export default Container;
