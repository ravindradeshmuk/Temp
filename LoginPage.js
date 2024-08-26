import React, { useState, useContext } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, CircularProgress, useMediaQuery, useTheme, IconButton, InputAdornment
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Components/UserContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import Cookies from 'js-cookie';

const LoginPage = () => {
  const apiDomain = process.env.REACT_APP_API_DOMAIN;
  const { handleSubmit, control, formState: { errors } } = useForm();
  const [loginDialogOpen, setLoginDialogOpen] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const existingToken = Cookies.get("token");

      if (existingToken) {
        setSnackbarMessage("A user is already logged in. Please log out first.");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const response = await axios.post(`${apiDomain}/user/api/login`, data);
      const { token, user } = response.data;

      login(token, user);

      setSnackbarMessage("Login successful");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setLoginDialogOpen(false);

      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error logging in:", error);
      const errorMessage = error.response?.data?.message || "Login failed, please try again";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginDialogToggle = () => {
    setLoginDialogOpen(!loginDialogOpen);
    navigate('/home');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleForgotPasswordDialogToggle = () => {
    setForgotPasswordDialogOpen(!forgotPasswordDialogOpen);
  };

  return (
    <div>
      <Dialog open={loginDialogOpen} onClose={handleLoginDialogToggle} fullScreen={fullScreen}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent sx={{ minWidth: { xs: "280px", sm: "400px" } }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{ required: "Email is required", pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email address" } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  id="email"
                  label="Email Address"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ""}
                  disabled={loading}
                  sx={{ marginBottom: "16px" }}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              defaultValue=""
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password ? errors.password.message : ""}
                  disabled={loading}
                  sx={{ marginBottom: "16px" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: "16px" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </form>
          <Button onClick={handleForgotPasswordDialogToggle} sx={{ marginTop: "16px" }}>
            Forgot Password?
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginDialogToggle} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <ForgotPasswordDialog open={forgotPasswordDialogOpen} onClose={handleForgotPasswordDialogToggle} />

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginPage;
