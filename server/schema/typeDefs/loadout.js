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
    "Derived: slots changed since the last mark-as-keyed-in"
    isStale: Boolean!
    keyedInAt: String
    slotsChangedAt: String
    createdAt: String
    updatedAt: String
  }

  """
  One bank in a full-array slot write. Semantics:
  - filmSimId set: assign that recipe to the bank.
  - filmSimId omitted: PRESERVE the bank's current contents server-side —
    this keeps a dangling filmSimName snapshot alive when the client echoes
    back a slot whose recipe was deleted.
  - index omitted from the array entirely: the bank becomes empty.
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
