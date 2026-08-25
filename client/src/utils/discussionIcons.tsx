import CameraIcon from "@mui/icons-material/CameraAlt";
import PresetIcon from "@mui/icons-material/Palette";
import TrendingIcon from "@mui/icons-material/TrendingUp";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SortIcon from "@mui/icons-material/Sort";
import TechniqueIcon from "@mui/icons-material/Build";
import EquipmentIcon from "@mui/icons-material/Camera";
import LocationIcon from "@mui/icons-material/LocationOn";
import TutorialIcon from "@mui/icons-material/School";
import ReviewIcon from "@mui/icons-material/Star";
import ChallengeIcon from "@mui/icons-material/EmojiEvents";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import InspirationIcon from "@mui/icons-material/Lightbulb";
import CritiqueIcon from "@mui/icons-material/RateReview";
import NewsIcon from "@mui/icons-material/Article";
import EventIcon from "@mui/icons-material/Event";
import GeneralIcon from "@mui/icons-material/ChatBubble";
import LikeIcon from "@mui/icons-material/ThumbUp";

export const getSortIcon = (sortBy: string) => {
  switch (sortBy) {
    case "newest":
      return <ScheduleIcon />;
    case "oldest":
      return <ScheduleIcon />;
    case "mostActive":
      return <TrendingIcon />;
    case "mostReactions":
      return <LikeIcon />;
    default:
      return <SortIcon />;
  }
};

export const getDiscussionTypeIcon = (type: string) => {
  switch (type) {
    case "PRESET":
      return <PresetIcon />;
    case "FILMSIM":
      return <CameraIcon />;
    case "TECHNIQUE":
      return <TechniqueIcon />;
    case "EQUIPMENT":
      return <EquipmentIcon />;
    case "LOCATION":
      return <LocationIcon />;
    case "TUTORIAL":
      return <TutorialIcon />;
    case "REVIEW":
      return <ReviewIcon />;
    case "CHALLENGE":
      return <ChallengeIcon />;
    case "WORKFLOW":
      return <WorkflowIcon />;
    case "INSPIRATION":
      return <InspirationIcon />;
    case "CRITIQUE":
      return <CritiqueIcon />;
    case "NEWS":
      return <NewsIcon />;
    case "EVENT":
      return <EventIcon />;
    case "GENERAL":
      return <GeneralIcon />;
    default:
      return <GeneralIcon />;
  }
};

export const getDiscussionTypeLabel = (type: string) => {
  switch (type) {
    case "PRESET":
      return "Preset";
    case "FILMSIM":
      return "Film Simulation";
    case "TECHNIQUE":
      return "Technique";
    case "EQUIPMENT":
      return "Equipment";
    case "LOCATION":
      return "Location";
    case "TUTORIAL":
      return "Tutorial";
    case "REVIEW":
      return "Review";
    case "CHALLENGE":
      return "Challenge";
    case "WORKFLOW":
      return "Workflow";
    case "INSPIRATION":
      return "Inspiration";
    case "CRITIQUE":
      return "Critique";
    case "NEWS":
      return "News";
    case "EVENT":
      return "Event";
    case "GENERAL":
      return "General";
    default:
      return type;
  }
};
