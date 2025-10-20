import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./config/apolloClient";
import NavBar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/Profile";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ContentTypeProvider } from "./context/ContentTypeFilter";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import SearchView from "./pages/SearchView";
import PresetDetailPage from "./pages/PresetDetail";
import FilmSimPage from "./pages/FilmSimDetail";
import UploadPage from "./pages/Upload";
import UploadPreset from "./pages/UploadPreset";
import UploadFilmSim from "./pages/UploadFilmSim";
import NotFound from "./pages/NotFound";
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import { visorTheme } from "./theme/VISORTheme";
import CreateList from "./pages/CreateList";
import PublicProfile from "./pages/PublicProfile";
import Discussions from "./pages/Discussions";
import DiscussionDetail from "./pages/DiscussionDetail";
import CreateDiscussion from "./pages/CreateDiscussion";
import Notifications from "./pages/Notifications";
import EmailVerification from "./pages/EmailVerification";
import { ServiceContainer } from "./core/container/ServiceContainer";
import { useNavigate } from "react-router-dom";

// Service container initialization component
const ServiceContainerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const container = ServiceContainer.getInstance();

  React.useEffect(() => {
    container.initialize(apolloClient, navigate);
  }, [navigate]);

  return <>{children}</>;
};

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={visorTheme}>
        <CssBaseline />
        <Router>
          <ServiceContainerProvider>
            <AuthProvider>
              <NotificationProvider>
                <ContentTypeProvider>
                  <NavBar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<SearchView />} />
                    <Route
                      path="/preset/:slug"
                      element={<PresetDetailPage />}
                    />
                    <Route path="/filmsim/:slug" element={<FilmSimPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route
                      path="/profile/:userId"
                      element={<PublicProfile />}
                    />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/upload/preset" element={<UploadPreset />} />
                    <Route path="/upload/filmsim" element={<UploadFilmSim />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/verify-email"
                      element={<EmailVerification />}
                    />
                    <Route path="/lists" element={<Lists />} />
                    <Route path="/list/:id" element={<ListDetail />} />
                    <Route path="/create-list" element={<CreateList />} />
                    <Route path="/discussions" element={<Discussions />} />
                    <Route
                      path="/discussions/new"
                      element={<CreateDiscussion />}
                    />
                    <Route
                      path="/discussions/:discussionId"
                      element={<DiscussionDetail />}
                    />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ContentTypeProvider>
              </NotificationProvider>
            </AuthProvider>
          </ServiceContainerProvider>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
