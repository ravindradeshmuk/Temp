import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "./UserContext";
import {
  Typography, Container, Paper, Tabs, Tab, Box, TextField, Button, CircularProgress, Snackbar, Alert, Checkbox, FormControlLabel, MenuItem,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

const Profile = () => {
  const { firstName, lastName, email, team, role, status, logout } = useContext(AuthContext);
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();
  const apiDomain = process.env.REACT_APP_API_DOMAIN;

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [headings, setHeadings] = useState([]);
  const [selectedHeadings, setSelectedHeadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [userId, setUserId] = useState(null);
  const { handleSubmit, control, formState: { errors }, getValues } = useForm();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiDomain}/api/trackerConfig/api/trackerConfig`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setSnackbarMessage("Failed to fetch products");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiDomain]);

  const handleProductChange = async (event) => {
    const product = event.target.value;
    setSelectedProduct(product);
    setLoading(true);

    try {
      // Fetch product headings
      const productResponse = await axios.get(`${apiDomain}/api/trackerConfig/change-view-data/${product}`);
      const productHeadings = productResponse.data.headings;

      // Fetch user preferences
      const userResponse = await axios.get(`${apiDomain}/api/trackerConfig/api/userdata/${email}/${product}`);
      const { userId, selectedHeadings } = userResponse.data;

      // Update state with product headings and user's selected headings
      setUserId(userId);
      setHeadings(productHeadings);
      setSelectedHeadings(selectedHeadings);
    } catch (error) {
      console.error("Error fetching headings or user data:", error);
      setSnackbarMessage("Failed to fetch headings or user data");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleHeadingChange = (event) => {
    const heading = event.target.name;
    setSelectedHeadings(prev =>
      event.target.checked
        ? [...prev, heading]
        : prev.filter(h => h !== heading)
    );
  };

  const handleSubmitChangeView = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${apiDomain}/api/trackerConfig/api/userdata/update-preferences`, {
        userId,
        selectedHeadings,
        product: selectedProduct,
      });
      setSnackbarMessage(response.data.message || "View preferences updated successfully");
      setSnackbarSeverity("success");
      
      // Optionally, you can refetch the user data here to update the UI
      // await handleProductChange({ target: { value: selectedProduct } });
    } catch (error) {
      console.error("Error updating view preferences:", error);
      setSnackbarMessage(error.response?.data?.error || "Failed to update preferences");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };
  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await axios.post(`${apiDomain}/user/mail/reset-password`, { email, newPassword: data.newPassword });

      setSnackbarMessage("Password reset successful. Logging out...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || error.message || "Failed to reset password");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };


  // ... (rest of the component code remains the same)

  return (
    <Container component={Paper} sx={{ padding: "20px", marginTop: "20px" }}>
      {/* ... (other tabs and content remain the same) */}
	   <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)}>
        <Tab label="Personal Info" />
        <Tab label="Change View" />
        <Tab label="Change Password" />
      </Tabs>
      <Box sx={{ marginTop: "20px" }}>
        {tabIndex === 0 && (
          <div>
            <Typography variant="body1"><strong>First Name:</strong> {firstName}</Typography>
            <Typography variant="body1"><strong>Last Name:</strong> {lastName}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {email}</Typography>
            <Typography variant="body1"><strong>Team:</strong> {team}</Typography>
            <Typography variant="body1"><strong>Role:</strong> {role}</Typography>
            <Typography variant="body1"><strong>Status:</strong> {status}</Typography>
          </div>
        )}
      {tabIndex === 1 && (
        <div>
          <TextField
            select
            label="Select Product"
            fullWidth
            value={selectedProduct}
            onChange={handleProductChange}
            sx={{ marginBottom: "20px" }}
          >
            {products.map((product) => (
              <MenuItem key={product} value={product}>
                {product}
              </MenuItem>
            ))}
          </TextField>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {headings.map((heading) => (
                <FormControlLabel
                  key={heading}
                  control={
                    <Checkbox
                      checked={selectedHeadings.includes(heading)}
                      onChange={handleHeadingChange}
                      name={heading}
                    />
                  }
                  label={heading}
                />
              ))}
              <Button
                variant="contained"
                onClick={handleSubmitChangeView}
                sx={{ marginTop: "20px" }}
                disabled={!selectedProduct || selectedHeadings.length === 0}
              >
                Submit
              </Button>
            </>
          )}
        </div>
      )}
      {/* ... (other tabs and content remain the same) */}
	  {tabIndex === 2 && (
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <Controller
              name="newPassword"
              control={control}
              defaultValue=""
              rules={{ required: "New password is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="New Password"
                  type="password"
                  fullWidth
                  error={!!errors.newPassword}
                  helperText={errors.newPassword ? errors.newPassword.message : ""}
                  disabled={loading}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              rules={{
                required: "Please confirm your password",
                validate: value => value === getValues("newPassword") || "Passwords do not match",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword ? errors.confirmPassword.message : ""}
                  disabled={loading}
                  sx={{ marginTop: "16px" }}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ marginTop: "16px" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>
          </form>
        )}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
   </Container>
  );
};

export default Profile;
