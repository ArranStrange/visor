import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import apolloClient from "@gql/apolloClient";
import NavBar from "components/layout/Navbar";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ContentTypeProvider } from "context/ContentTypeFilter";
import { AuthProvider } from "context/AuthContext";
import { NotificationProvider } from "context/NotificationContext";
import { AdminProvider } from "context/AdminContext";
import { TagProvider } from "context/TagContext";
import { visorTheme } from "theme/VISORTheme";
import { ServiceContainer } from "core/container/ServiceContainer";
import { useNavigate } from "react-router-dom";

// Route imports (SFG20-style route structure)
import HomeRoute from "routes/home/home-route";
import SearchRoute from "routes/search/search-route";
import PresetDetailRoute from "routes/preset/preset-detail-route";
import FilmSimDetailRoute from "routes/filmsim/filmsim-detail-route";
import ProfileRoute from "routes/profile/profile-route";
import PublicProfileRoute from "routes/profile/public-profile-route";
import UploadRoute from "routes/upload/upload-route";
import UploadPresetRoute from "routes/upload/upload-preset-route";
import UploadFilmSimRoute from "routes/upload/upload-filmsim-route";
import LoginRoute from "routes/auth/login-route";
import RegisterRoute from "routes/auth/register-route";
import EmailVerificationRoute from "routes/auth/email-verification-route";
import MyListsRoute from "routes/lists/my-lists-route";
import BrowseListsRoute from "routes/lists/browse-lists-route";
import ListDetailRoute from "routes/lists/list-detail-route";
import CreateListRoute from "routes/lists/create-list-route";
import DiscussionsRoute from "routes/discussions/discussions-route";
import DiscussionDetailRoute from "routes/discussions/discussion-detail-route";
import CreateDiscussionRoute from "routes/discussions/create-discussion-route";
import NotificationsRoute from "routes/notifications-route";
import NotFoundRoute from "routes/not-found-route";

// Initialize services at module level
const container = ServiceContainer.getInstance();
container.initialize(apolloClient);

// Service container provider component
const ServiceContainerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    container.setNavigationFunction(navigate);
  }, [navigate]);

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={visorTheme}>
      <CssBaseline />
      <Router>
        <ServiceContainerProvider>
          <AuthProvider>
            <AdminProvider>
              <NotificationProvider>
                <ContentTypeProvider>
                  <TagProvider>
                    <NavBar />
                    <Routes>
                      <Route path="/" element={<HomeRoute />} />
                      <Route path="/explore" element={<SearchRoute />} />
                      <Route
                        path="/preset/:slug"
                        element={<PresetDetailRoute />}
                      />
                      <Route
                        path="/filmsim/:slug"
                        element={<FilmSimDetailRoute />}
                      />
                      <Route path="/profile" element={<ProfileRoute />} />
                      <Route
                        path="/profile/:userId"
                        element={<PublicProfileRoute />}
                      />
                      <Route path="/upload" element={<UploadRoute />} />
                      <Route
                        path="/upload/preset"
                        element={<UploadPresetRoute />}
                      />
                      <Route
                        path="/upload/filmsim"
                        element={<UploadFilmSimRoute />}
                      />
                      <Route path="/login" element={<LoginRoute />} />
                      <Route path="/register" element={<RegisterRoute />} />
                      <Route
                        path="/verify-email"
                        element={<EmailVerificationRoute />}
                      />
                      <Route path="/lists" element={<MyListsRoute />} />
                      <Route
                        path="/browse-lists"
                        element={<BrowseListsRoute />}
                      />
                      <Route path="/list/:id" element={<ListDetailRoute />} />
                      <Route
                        path="/create-list"
                        element={<CreateListRoute />}
                      />
                      <Route
                        path="/discussions"
                        element={<DiscussionsRoute />}
                      />
                      <Route
                        path="/discussions/new"
                        element={<CreateDiscussionRoute />}
                      />
                      <Route
                        path="/discussions/:discussionId"
                        element={<DiscussionDetailRoute />}
                      />
                      <Route
                        path="/notifications"
                        element={<NotificationsRoute />}
                      />
                      <Route path="*" element={<NotFoundRoute />} />
                    </Routes>
                  </TagProvider>
                </ContentTypeProvider>
              </NotificationProvider>
            </AdminProvider>
          </AuthProvider>
        </ServiceContainerProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
