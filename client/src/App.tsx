import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import HomePage from "./pages/Home";
import PresetDetailPage from "./pages/PresetDetail";
import FilmSimPage from "./pages/FilmSimDetail";
import ProfilePage from "./pages/Profile";
import UploadPage from "./pages/Upload";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import NotFound from "./pages/NotFound";
import NavBar from "./components/layout/Navbar";
import { visorTheme } from "./theme/visorTheme";
import SearchView from "./pages/SearchView";
import { ContentTypeProvider } from "./context/ContentTypeFilter";

function App() {
  return (
    <ThemeProvider theme={visorTheme}>
      <CssBaseline />
      <ContentTypeProvider>
        <Router>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/preset/:slug" element={<PresetDetailPage />} />
            <Route path="/filmsim/:slug" element={<FilmSimPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ContentTypeProvider>
    </ThemeProvider>
  );
}

export default App;
