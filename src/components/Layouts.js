import CustomHead from "./Head";
import React from "react";


const Layout = ({ children }) => {
  return (
    <>
      <CustomHead />
      <div className="outter-grid">{children}</div>
    </>
  );
};

export default Layout;
