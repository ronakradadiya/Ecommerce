import React from "react";
import { API } from "../../backend";

const ImageHelper = ({ product }) => {
  const imageurl = product
    ? `${API}/product/photo/${product._id}`
    : `https://images.pexels.com/photos/1887975/pexels-photo-1887975.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260`;
  return (
    <div className="rounded border border-success p-2">
      <img
        src={imageurl}
        alt="Tshirts"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
        className="mb-3 rounded"
      />
    </div>
  );
};

export default ImageHelper;
