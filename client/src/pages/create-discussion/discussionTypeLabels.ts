export type DiscussionLinkedType =
  | "PRESET"
  | "FILMSIM"
  | "TECHNIQUE"
  | "EQUIPMENT"
  | "LOCATION"
  | "TUTORIAL"
  | "REVIEW"
  | "CHALLENGE"
  | "WORKFLOW"
  | "INSPIRATION"
  | "CRITIQUE"
  | "NEWS"
  | "EVENT"
  | "GENERAL";

export function getDiscussionTypeLabel(type: string): string {
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
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
