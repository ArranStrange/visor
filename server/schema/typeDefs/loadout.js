const { gql } = require("apollo-server-express");

// Loadouts are personal: every query and mutation resolves the owner from
// the auth context. There is deliberately no userId argument and no public
// browsing surface in this stage — sharing is a later, explicit addition.
module.exports = gql`
  type LoadoutSlot {
    "0-based bank position, rendered as C1..Cn"
    index: Int!
    "Nullable: empty slot, or the referenced recipe was deleted"
    filmSim: FilmSim
    "Name snapshot from assignment time — survives recipe deletion"
    filmSimName: String
    note: String
    "The recipe was edited after this slot was keyed into the camera"
    sourceChanged: Boolean!
  }

  type Loadout {
    id: ID!
    name: String!
    owner: User!
    "Camera name as the user wrote it"
    camera: String!
    "Normalized camera identity"
    cameraKey: String!
    "Bank count snapshotted at creation"
    customBanks: Int!
    slots: [LoadoutSlot!]!
    isActive: Boolean!
    "Derived: the camera no longer matches this loadout"
    isStale: Boolean!
    "Why the camera no longer matches; null when current"
    staleReason: LoadoutStaleReason
    keyedInAt: String
    slotsChangedAt: String
    createdAt: String
    updatedAt: String
  }

  enum LoadoutStaleReason {
    "You edited the loadout after keying it in"
    SLOTS_CHANGED
    "A recipe was edited by its author after you keyed it in"
    SOURCE_CHANGED
  }

  """
  One bank in a full-array slot write. Semantics:
  - filmSimId set: assign that recipe to the bank.
  - filmSimId omitted: PRESERVE the bank's current contents server-side —
    this keeps a dangling filmSimName snapshot alive when the client echoes
    back a slot whose recipe was deleted.
  - index omitted from the array entirely: the bank becomes empty.
  - note omitted on a preserved bank: the existing note is kept (there is
    currently no way to clear a note without reassigning the bank).
  """
  input LoadoutSlotInput {
    index: Int!
    filmSimId: ID
    note: String
  }

  input CreateLoadoutInput {
    name: String!
    camera: String!
  }

  extend type Query {
    "The caller's loadouts, optionally filtered to one camera"
    getMyLoadouts(camera: String): [Loadout!]!
    getLoadout(id: ID!): Loadout
    "The caller's active loadout for a camera, if any"
    getActiveLoadout(camera: String!): Loadout
  }

  extend type Mutation {
    createLoadout(input: CreateLoadoutInput!): Loadout!
    renameLoadout(id: ID!, name: String!): Loadout!
    deleteLoadout(id: ID!): Boolean!
    "Atomic full replacement of the slot array — the only slot write"
    setLoadoutSlots(id: ID!, slots: [LoadoutSlotInput!]!): Loadout!
    setActiveLoadout(id: ID!): Loadout!
    markLoadoutKeyedIn(id: ID!): Loadout!
  }
`;
