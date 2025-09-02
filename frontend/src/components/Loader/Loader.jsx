import React from "react";
import { ScaleLoader } from "react-spinners";

const Loader = () => {
  return (
    <div style={styles.overlay}>
      <ScaleLoader color="#2096f3" height={40} width={6} radius={2} margin={2} />
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // un poco de opacidad
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
};

export default Loader;
