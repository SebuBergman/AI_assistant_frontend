import { TextField } from "@mui/material";

interface TemperatureControlProps {
  temperature: number;
  onTemperatureChange: (temp: number) => void;
}

export const TemperatureControl = ({
  temperature,
  onTemperatureChange,
}: TemperatureControlProps) => {
  return (
    <TextField
      size="small"
      label="Temperature"
      type="number"
      value={temperature}
      onChange={(e) => {
        const val = parseFloat(e.target.value);
        if (val >= 0 && val <= 2) onTemperatureChange(val);
      }}
      inputProps={{ min: 0, max: 2, step: 0.1 }}
      sx={{ width: 120 }}
    />
  );
};