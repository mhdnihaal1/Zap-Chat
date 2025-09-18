import React from "react";
import ReactDOM from "react-dom";

function PhotoPicker({ onChange }) {
  if (typeof window === "undefined") return null; // avoid SSR

  return ReactDOM.createPortal(
    <input
      type="file"
      name="image"
      hidden
      id="photo-picker"
      onChange={onChange}
    />,
    document.getElementById("photo-picker-element")
  );
}

export default PhotoPicker;
