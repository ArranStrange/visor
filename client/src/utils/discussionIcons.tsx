import {
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
  Sort as SortIcon,
  Build as TechniqueIcon,
  Camera as EquipmentIcon,
  LocationOn as LocationIcon,
  School as TutorialIcon,
  Star as ReviewIcon,
  EmojiEvents as ChallengeIcon,
  AccountTree as WorkflowIcon,
  Lightbulb as InspirationIcon,
  RateReview as CritiqueIcon,
  Article as NewsIcon,
  Event as EventIcon,
  ChatBubble as GeneralIcon,
  ThumbUp as LikeIcon,
} from "@mui/icons-material";

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
