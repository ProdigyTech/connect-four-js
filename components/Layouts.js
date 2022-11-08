import CustomHead from "./Head";
import React from "react";
import styles from "../styles/Layout.module.scss";

const Layout = ({ children }) => {
  return (
    <>
      <CustomHead />
      <div className="outter-grid">{children}</div>
    </>
  );
};

export default Layout;
