import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import NavBar from "./components/layout/Navbar";
import RouteErrorBoundary from "./components/ui/RouteErrorBoundary";
import Home from "./pages/Home";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ContentTypeProvider } from "./context/ContentTypeFilter";
import { ShuffleProvider } from "./context/ShuffleContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { TagProvider } from "./context/TagContext";
import { visorTheme } from "./theme/VISORTheme";

const SearchView = lazy(() => import("./pages/SearchView"));
const PresetDetailPage = lazy(() => import("./pages/PresetDetail"));
const FilmSimPage = lazy(() => import("./pages/FilmSimDetail"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const UploadPage = lazy(() => import("./pages/Upload"));
const UploadPreset = lazy(() => import("./pages/UploadPreset"));
const UploadFilmSim = lazy(() => import("./pages/upload-film-sim"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const MyLists = lazy(() => import("./pages/MyLists"));
const Wallet = lazy(() => import("./pages/Wallet"));
const BrowseLists = lazy(() => import("./pages/BrowseLists"));
const ListDetail = lazy(() => import("./pages/list-detail"));
const CreateList = lazy(() => import("./pages/CreateList"));
const Discussions = lazy(() => import("./pages/Discussions"));
const CreateDiscussion = lazy(() => import("./pages/create-discussion"));
const DiscussionDetail = lazy(() => import("./pages/discussion-detail"));
const Notifications = lazy(() => import("./pages/notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <ThemeProvider theme={visorTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <ContentTypeProvider>
              <ShuffleProvider>
                <TagProvider>
                  <NavBar />
                  <RouteErrorBoundary>
                    <Suspense
                      fallback={
                        <Box
                          sx={{
                            minHeight: "calc(100vh - 64px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "background.default",
                          }}
                        >
                          <CircularProgress aria-label="Loading page" />
                        </Box>
                      }
                    >
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/search" element={<SearchView />} />
                        <Route
                          path="/preset/:slug"
                          element={<PresetDetailPage />}
                        />
                        <Route
                          path="/filmsim/:slug"
                          element={<FilmSimPage />}
                        />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route
                          path="/profile/:userId"
                          element={<PublicProfile />}
                        />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route
                          path="/upload/preset"
                          element={<UploadPreset />}
                        />
                        <Route
                          path="/upload/filmsim"
                          element={<UploadFilmSim />}
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                          path="/verify-email"
                          element={<EmailVerification />}
                        />
                        <Route path="/lists" element={<MyLists />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/browse-lists" element={<BrowseLists />} />
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
                        <Route
                          path="/notifications"
                          element={<Notifications />}
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </RouteErrorBoundary>
                </TagProvider>
              </ShuffleProvider>
            </ContentTypeProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
