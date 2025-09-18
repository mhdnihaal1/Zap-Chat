import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "../common/Avatar";
import { FaPlay, FaPause } from "react-icons/fa";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import { HOST } from "@/utils/ApiRoutes";
import WaveSurfer from "wavesurfer.js";

function VoiceMessage({ message }) {
  const [{ currentChatUser, userInfo }] = useStateProvider();
  const [audioMessage, setAudioMessage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const waveFormRef = useRef(null);
  const waveForm = useRef(null);
  useEffect(() => {
    if (!waveForm.current) {
      waveForm.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorWidth: 2,
        height: 30,
        responsive: true,
      });

      waveForm.current.on("finish", () => setIsPlaying(false));
    }

    return () => {
      waveForm.current && waveForm.current.destroy();
    };
  }, []);

  useEffect(() => {
    const audioURL = `${HOST}/${message.message}`;

    const audio = new Audio(audioURL);
    setAudioMessage(audio);
    waveForm.current?.load(audioURL);
    waveForm.current?.on("ready", () => {
      setTotalDuration(waveForm.current.getDuration());
    });
  }, [message.message]);

  useEffect(() => {
    if (audioMessage) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(audioMessage.currentTime);
      };
      audioMessage.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        audioMessage.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [audioMessage]);

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayAudio = () => {
    console.log("handlePlayRecording");
    if (audioMessage) {
      waveForm.current.stop();
      audioMessage.play();
      setIsPlaying(true);
      audioMessage.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handlePauseAudio = () => {
    console.log("handlePauseRecording");

    waveForm.current.stop();
    audioMessage.pause();
    setIsPlaying(false);
  };
  const isSentByMe = message?.sender?._id === userInfo._id;
  const isIncoming = !isSentByMe;
    return (
    <div
      className={`flex items-end gap-3 mb-4 ${
        isIncoming ? "justify-start" : "justify-end"
      }`}
    >
      {/* {isIncoming && (
        <Avatar type="sm" image={currentChatUser?.profilePicture} />
      )} */}

      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-md flex flex-col ${
          isIncoming
            ? "bg-gray-900 text-white"
            : "bg-outgoing-background"
        }`}
      >
        {/* Play/Pause + Waveform */}
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? handlePauseAudio : handlePlayAudio}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            {isPlaying ? (
              <FaPause className="text-white" />
            ) : (
              <FaPlay className="text-white ml-1" />
            )}
          </button>

          <div className="w-48">
            <div ref={waveFormRef} className="w-full" />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>{formatTime(isPlaying ? currentPlaybackTime : totalDuration)}</span>
          <div className="flex gap-1 items-center">
            <span>{calculateTime(message.createdAt)}</span>
             {message.sender._id === userInfo._id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default VoiceMessage;
