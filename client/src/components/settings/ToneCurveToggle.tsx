import { ToggleButtonGroup, ToggleButton, Box } from "@mui/material";

const ToneCurveToggle = ({
  channel,
  setChannel,
}: {
  channel: string;
  setChannel: (val: string) => void;
}) => {
  return (
    <ToggleButtonGroup
      value={channel}
      exclusive
      onChange={(_, val) => val && setChannel(val)}
      size="small"
      sx={{ mb: 2 }}
    >
      <ToggleButton value="rgb">RGB</ToggleButton>
      <ToggleButton value="red">
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "red",
          }}
        />
      </ToggleButton>
      <ToggleButton value="green">
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "green",
          }}
        />
      </ToggleButton>
      <ToggleButton value="blue">
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "blue",
          }}
        />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ToneCurveToggle;
