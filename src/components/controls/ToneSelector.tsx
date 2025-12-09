// components/ToneSelector.tsx
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface ToneSelectorProps {
  tone: string;
  onToneChange: (tone: string) => void;
  tones: string[];
}

export const ToneSelector = ({
  tone,
  onToneChange,
  tones,
}: ToneSelectorProps) => {
  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Tone</InputLabel>
      <Select
        value={tone}
        onChange={(e) => onToneChange(e.target.value)}
        label="Tone"
      >
        {tones.map((toneOption) => (
          <MenuItem key={toneOption} value={toneOption}>
            {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};