import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });

  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      if (data) data.click();
      document.body.onfocus = () => {
        setTimeout(() => setGrabPhoto(false), 1000);
      };
    }
  }, [grabPhoto]);

  const photoPickerChange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const data = document.createElement("img");
    reader.onload = function (event) {
      data.src = event.target.result;
      data.setAttribute("data-src", event.target.result);
    };
    reader.readAsDataURL(file);
    setTimeout(() => {
      setImage(data.src);
    }, 100);
  };

  const contextMenuOptions = [
    { name: "Take Photo", callback: () => setShowCapturePhoto(true) },
    { name: "Choose from Library", callback: () => setShowPhotoLibrary(true) },
    { name: "Upload Photo", callback: () => setGrabPhoto(true) },
    { name: "Remove Photo", callback: () => setImage("/default_avatar.png") },
  ];

  const renderImageSize = () => {
    const sizeMap = {
      sm: "h-10 w-10",
      lg: "h-14 w-14",
      xl: "h-60 w-60",
    };
    return sizeMap[type] || "h-10 w-10";
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <div
          className={`relative ${renderImageSize()}`}
          onMouseEnter={() => type === "xl" && setHover(true)}
          onMouseLeave={() => type === "xl" && setHover(false)}
        >
          {type === "xl" && (
            <div
              className={`absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center flex-col gap-2 rounded-full bg-black bg-opacity-50 text-white text-center cursor-pointer transition-opacity ${
                hover ? "opacity-100" : "opacity-0"
              }`}
              onClick={showContextMenu}
            >
              <FaCamera className="text-2xl" />
              <span>
                Change Profile
                <br />
                Photo
              </span>
            </div>
          )}
          <Image
            src={image}
            className="rounded-full object-cover"
            alt="Default Avatar"
            fill
            sizes="(max-width: 768px) 40px, 80px"
            priority
          />
        </div>
      </div>

      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCoordinates}
          contextMenu={isContextMenuVisible}
          setContextmenu={setIsContextMenuVisible}
        />
      )}

      {showCapturePhoto && (
        <CapturePhoto setImage={setImage} hide={setShowCapturePhoto} />
      )}
      {showPhotoLibrary && (
        <PhotoLibrary
          setImage={setImage}
          hidePhotoLibrary={setShowPhotoLibrary}
        />
      )}
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
    </>
  );
}

export default Avatar;
