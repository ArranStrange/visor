import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  GET_MY_LOADOUTS,
  CREATE_LOADOUT,
  SET_LOADOUT_SLOTS,
  SET_ACTIVE_LOADOUT,
  MARK_LOADOUT_KEYED_IN,
  type GetMyLoadoutsData,
} from "@/features/loadouts/graphql/loadouts";
import type { Loadout, LoadoutSlot } from "@/features/loadouts/types/loadouts";
import SlotRow from "@/features/loadouts/components/SlotRow";
import SlotDetailDialog from "@/features/loadouts/components/SlotDetailDialog";
import FillSlotDialog from "@/features/loadouts/components/FillSlotDialog";
import CreateLoadoutDialog from "@/features/loadouts/components/CreateLoadoutDialog";
import { getSensorForCamera, getSensorCompatibilityWarnings } from "@/features/film-sims/utils/fujifilmSensors";

// The wallet: what's in the camera right now. One loadout is active per
// body; slots render at stable positions C1..Cn including empties, so the
// screen always mirrors the physical dial.
const Wallet: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<GetMyLoadoutsData>(GET_MY_LOADOUTS, {
    skip: !isAuthenticated,
  });

  const [mutationError, setMutationError] = useState<string | null>(null);
  const onError = (err: Error) => setMutationError(err.message);

  const [createLoadout, { loading: creating }] = useMutation(CREATE_LOADOUT, {
    refetchQueries: [{ query: GET_MY_LOADOUTS }],
    onError,
  });
  const [setLoadoutSlots, { loading: savingSlots }] = useMutation(
    SET_LOADOUT_SLOTS,
    { onError }
  );
  // setActiveLoadout deactivates siblings server-side; refetch so their
  // cached isActive flags don't go stale.
  const [setActiveLoadout, { loading: activating }] = useMutation(
    SET_ACTIVE_LOADOUT,
    { refetchQueries: [{ query: GET_MY_LOADOUTS }], onError }
  );
  const [markKeyedIn] = useMutation(MARK_LOADOUT_KEYED_IN, { onError });

  // Slot writes are full-array replaces built from the cache, so a second
  // write racing an in-flight one would be built from stale slots and
  // silently discard the first. One page-scoped busy flag serializes them.
  const busy = savingSlots || activating || creating;

  const loadouts = useMemo(() => data?.getMyLoadouts ?? [], [data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: Loadout | null =
    loadouts.find((l) => l.id === selectedId) ??
    loadouts.find((l) => l.isActive) ??
    loadouts[0] ??
    null;

  const [switcherAnchor, setSwitcherAnchor] = useState<null | HTMLElement>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [fillIndex, setFillIndex] = useState<number | null>(null);

  // Stable C1..Cn positions: map sparse slots onto the body's bank count.
  const banks: (LoadoutSlot | null)[] = useMemo(() => {
    if (!selected) return [];
    const byIndex = new Map(selected.slots.map((s) => [s.index, s]));
    return Array.from({ length: selected.customBanks }, (_, i) => byIndex.get(i) ?? null);
  }, [selected]);

  // Compatibility warnings are derived here, client-side, never stored.
  const sensorLabel = selected ? getSensorForCamera(selected.camera)?.label : undefined;
  const warningsFor = (slot: LoadoutSlot | null): string[] => {
    if (!slot?.filmSim?.settings || !sensorLabel) return [];
    return getSensorCompatibilityWarnings([sensorLabel], slot.filmSim.settings);
  };

  const filledCount = banks.filter((s) => s?.filmSim || s?.filmSimName).length;

  // Full-array replace: rebuild the slot input from current state plus the
  // one change. A slot without filmSimId is PRESERVED server-side — that's
  // what keeps a dangling filmSimName snapshot (deleted recipe) alive when
  // we echo it back. Clearing a bank = omitting its index.
  const writeSlots = (mutate: (slots: LoadoutSlot[]) => (LoadoutSlot | null)[]) => {
    if (!selected || busy) return;
    const next = mutate(selected.slots).filter((s): s is LoadoutSlot => s !== null);
    setLoadoutSlots({
      variables: {
        id: selected.id,
        slots: next.map((s) => ({
          index: s.index,
          ...(s.filmSim?.id ? { filmSimId: s.filmSim.id } : {}),
          note: s.note ?? null,
        })),
      },
    });
  };

  const handlePick = (filmSim: { id: string; name: string }) => {
    if (fillIndex === null) return;
    writeSlots((slots) => [
      ...slots.filter((s) => s.index !== fillIndex),
      {
        index: fillIndex,
        filmSim: { id: filmSim.id, name: filmSim.name, slug: "" },
        filmSimName: filmSim.name,
        note: null,
      },
    ]);
    setFillIndex(null);
  };

  const handleClear = () => {
    if (detailIndex === null) return;
    writeSlots((slots) => slots.filter((s) => s.index !== detailIndex));
    setDetailIndex(null);
  };

  if (!isAuthenticated) {
    return (
      <Box maxWidth="sm" mx="auto" px={2} py={4}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" component={RouterLink} to="/login">
              Log in
            </Button>
          }
        >
          Log in to see what's keyed into your camera.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth="sm" mx="auto" px={2} py={4}>
        <Alert severity="error">Couldn't load your loadouts.</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="sm" mx="auto" px={2} py={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography variant="h1">Wallet</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          variant="outlined"
          size="small"
        >
          New loadout
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        What's keyed into your camera right now.
      </Typography>

      {mutationError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMutationError(null)}>
          {mutationError}
        </Alert>
      )}

      {loadouts.length === 0 ? (
        <Alert severity="info">
          No loadouts yet. A loadout mirrors the custom settings banks in one
          of your Fujifilm bodies — create one and pack it from your lists.
        </Alert>
      ) : (
        selected && (
          <>
            <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
              <Button
                onClick={(e) => setSwitcherAnchor(e.currentTarget)}
                endIcon={<ExpandMoreIcon />}
                sx={{ fontWeight: 700, px: 1 }}
              >
                {selected.camera} · {selected.name}
              </Button>
              {selected.isActive ? (
                <Chip label="Active" size="small" color="secondary" variant="outlined" />
              ) : (
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => setActiveLoadout({ variables: { id: selected.id } })}
                >
                  Set active
                </Button>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                {filledCount} / {selected.customBanks} loaded
              </Typography>
            </Box>

            <Menu
              anchorEl={switcherAnchor}
              open={Boolean(switcherAnchor)}
              onClose={() => setSwitcherAnchor(null)}
            >
              {loadouts.map((loadout) => (
                <MenuItem
                  key={loadout.id}
                  selected={loadout.id === selected.id}
                  onClick={() => {
                    setSelectedId(loadout.id);
                    setSwitcherAnchor(null);
                  }}
                >
                  <ListItemText
                    primary={`${loadout.camera} · ${loadout.name}`}
                    secondary={loadout.isActive ? "Active" : undefined}
                  />
                </MenuItem>
              ))}
            </Menu>

            {selected.isStale && (
              <Alert
                severity="warning"
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<CheckIcon />}
                    onClick={() => markKeyedIn({ variables: { id: selected.id } })}
                  >
                    Mark as keyed in
                  </Button>
                }
              >
                Changed since you last keyed it into the camera.
              </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={1}>
              {banks.map((slot, index) => (
                <SlotRow
                  key={index}
                  index={index}
                  slot={slot}
                  warnings={warningsFor(slot)}
                  onClick={() =>
                    slot?.filmSim || slot?.filmSimName
                      ? setDetailIndex(index)
                      : setFillIndex(index)
                  }
                />
              ))}
            </Box>
          </>
        )
      )}

      <CreateLoadoutDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (input) => {
          // onError handles the failure path; only close on success so a
          // rejected create doesn't silently swallow the dialog.
          const result = await createLoadout({ variables: { input } });
          const created = result.data?.createLoadout;
          if (created) {
            setSelectedId(created.id);
            setCreateOpen(false);
          }
        }}
      />

      <FillSlotDialog
        open={fillIndex !== null}
        slotIndex={fillIndex}
        onClose={() => setFillIndex(null)}
        onPick={handlePick}
      />

      <SlotDetailDialog
        open={detailIndex !== null}
        slot={detailIndex !== null ? (banks[detailIndex] ?? null) : null}
        camera={selected?.camera ?? ""}
        warnings={detailIndex !== null ? warningsFor(banks[detailIndex] ?? null) : []}
        onClose={() => setDetailIndex(null)}
        onClear={handleClear}
        onReplace={() => {
          setFillIndex(detailIndex);
          setDetailIndex(null);
        }}
      />
    </Box>
  );
};

export default Wallet;
