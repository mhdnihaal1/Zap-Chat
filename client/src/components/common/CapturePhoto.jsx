import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

function CapturePhoto({ hide, setImage }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;
    const startCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoRef.current.srcObject = stream;
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 300, 150);
    setImage(canvas.toDataURL("image/jpeg"));
    hide(false);
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center">
  <div className="relative flex flex-col items-center bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
    
    {/* Top bar */}
    <div className="absolute top-0 w-full flex justify-between items-center px-4 py-2 text-white text-sm bg-black/40">
       <div className="flex gap-2 items-center">
       </div>
    </div>

    {/* Close button */}
    <button
      className="absolute top-2 right-2 text-white hover:text-red-400 transition"
      onClick={() => hide(false)}
    >
      <IoClose className="h-8 w-8" />
    </button>

    {/* Video preview */}
    <div className="bg-black rounded-lg overflow-hidden mt-10">
      <video
        id="video"
        className="rounded-lg shadow-lg"
        width="640"
        height="480"
        autoPlay
        ref={videoRef}
      ></video>
    </div>

    {/* Bottom camera controls */}
    <div className="flex justify-center items-center gap-12 mt-6 pb-4">
     
      <button
        className="h-20 w-20 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-105 transition-transform"
        onClick={capturePhoto}
      ></button>

      
    </div>
  </div>
</div>

  );
}

export default CapturePhoto;
