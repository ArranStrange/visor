import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./graphql/apolloClient";
import NavBar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/Profile";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ContentTypeProvider } from "./context/ContentTypeFilter";
import SearchView from "./pages/SearchView";
import PresetDetailPage from "./pages/PresetDetail";
import FilmSimPage from "./pages/FilmSimDetail";
import UploadPage from "./pages/Upload";
import NotFound from "./pages/NotFound";
import { visorTheme } from "./theme/visorTheme";

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={visorTheme}>
        <CssBaseline />
        <ContentTypeProvider>
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchView />} />
              <Route path="/preset/:slug" element={<PresetDetailPage />} />
              <Route path="/filmsim/:slug" element={<FilmSimPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ContentTypeProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
