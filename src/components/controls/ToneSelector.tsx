// components/ToneSelector.tsx
import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface ToneSelectorProps {
  tone: string;
  setTone: (tone: string) => void;
  tones: string[];
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
  tone,
  setTone,
  tones,
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Tone</InputLabel>
      <Select
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        label="Tone"
      >
        {tones.map((t) => (
          <MenuItem key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ToneSelector;