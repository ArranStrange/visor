import { gql } from "@apollo/client";
import type { Loadout, LoadoutSlotInput } from "@/features/loadouts/types/loadouts";

// Every mutation returns the full loadout so Apollo's normalized cache is
// coherent from the response alone — no refetch choreography.
const LOADOUT_FIELDS = gql`
  fragment LoadoutFields on Loadout {
    id
    name
    camera
    cameraKey
    customBanks
    isActive
    isStale
    keyedInAt
    slotsChangedAt
    slots {
      index
      filmSimName
      note
      filmSim {
        id
        name
        slug
        thumbnail
        compatibleSensors
        settings {
          dynamicRange
          filmSimulation
          whiteBalance
          wbShift {
            r
            b
          }
          # The output type spells this "colour"; the client-side
          # FilmSimSettings type uses "color" (same alias as filmSims.ts).
          color: colour
          sharpness
          highlight
          shadow
          noiseReduction
          grainEffect
          clarity
          colorChromeEffect
          colorChromeFxBlue
        }
        sampleImages {
          id
          url
        }
      }
    }
  }
`;

export interface GetMyLoadoutsData {
  getMyLoadouts: Loadout[];
}

export const GET_MY_LOADOUTS = gql`
  query GetMyLoadouts($camera: String) {
    getMyLoadouts(camera: $camera) {
      ...LoadoutFields
    }
  }
  ${LOADOUT_FIELDS}
`;

export interface CreateLoadoutData {
  createLoadout: Loadout;
}
export interface CreateLoadoutVariables {
  input: { name: string; camera: string };
}

export const CREATE_LOADOUT = gql`
  mutation CreateLoadout($input: CreateLoadoutInput!) {
    createLoadout(input: $input) {
      ...LoadoutFields
    }
  }
  ${LOADOUT_FIELDS}
`;

export interface SetLoadoutSlotsData {
  setLoadoutSlots: Loadout;
}
export interface SetLoadoutSlotsVariables {
  id: string;
  slots: LoadoutSlotInput[];
}

export const SET_LOADOUT_SLOTS = gql`
  mutation SetLoadoutSlots($id: ID!, $slots: [LoadoutSlotInput!]!) {
    setLoadoutSlots(id: $id, slots: $slots) {
      ...LoadoutFields
    }
  }
  ${LOADOUT_FIELDS}
`;

export const SET_ACTIVE_LOADOUT = gql`
  mutation SetActiveLoadout($id: ID!) {
    setActiveLoadout(id: $id) {
      ...LoadoutFields
    }
  }
  ${LOADOUT_FIELDS}
`;

export const MARK_LOADOUT_KEYED_IN = gql`
  mutation MarkLoadoutKeyedIn($id: ID!) {
    markLoadoutKeyedIn(id: $id) {
      ...LoadoutFields
    }
  }
  ${LOADOUT_FIELDS}
`;

export const RENAME_LOADOUT = gql`
  mutation RenameLoadout($id: ID!, $name: String!) {
    renameLoadout(id: $id, name: $name) {
      ...LoadoutFields
    }
  }
  ${LOADOUT_FIELDS}
`;

export const DELETE_LOADOUT = gql`
  mutation DeleteLoadout($id: ID!) {
    deleteLoadout(id: $id)
  }
`;
