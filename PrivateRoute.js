// import React, { useContext } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { AuthContext } from "../Components/UserContext";

// const PrivateRoute = ({ children }) => {
//   const { isLoggedIn } = useContext(AuthContext);
//   const location = useLocation();

//   if (!isLoggedIn) {
//     return <Navigate to="/login" state={{ from: location }} />;
//   }

//   return children;
// };

// export default PrivateRoute;
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Components/UserContext";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(false);
    };
    verifyAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
