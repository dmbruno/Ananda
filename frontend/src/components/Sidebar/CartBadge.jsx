import React from "react";
import PropTypes from "prop-types";
import "./cartBadge.css";

const CartBadge = ({ badgeContent, color = "primary", overlap = "circular", children }) => {
  return (
    <span className={`cart-badge-root ${color} ${overlap}`}>
      {children}
      {badgeContent > 0 && (
        <span className="cart-badge-badge">{badgeContent}</span>
      )}
    </span>
  );
};

CartBadge.propTypes = {
  badgeContent: PropTypes.number.isRequired,
  color: PropTypes.oneOf(["primary", "secondary", "error", "success", "warning"]),
  overlap: PropTypes.oneOf(["circular", "rectangular"]),
  children: PropTypes.node
};

export default CartBadge;
