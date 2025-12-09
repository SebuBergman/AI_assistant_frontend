// components/ModelSelector.tsx
import React, { JSX } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  Typography,
  Tooltip,
  TextField,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ToneSelector from "./ToneSelector";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  pricing: {
    input: string;
    output: string;
  };
}

interface ModelSelectorProps {
  activeFeature: "ai" | "email";

  // AI model mode
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  temperature: number;
  setTemperature: (t: number) => void;

  deepseekModels: ModelOption[];
  chatgptModels: ModelOption[];
  claudeModels: ModelOption[];

  // Email tone mode
  tone: string;
  setTone: (tone: string) => void;
  tones: string[];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  activeFeature,
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  deepseekModels,
  chatgptModels,
  claudeModels,
  tone,
  setTone,
  tones,
}) => {
  const renderModelSection = (
    title: string,
    models: ModelOption[]
  ): JSX.Element[] => [
    <ListSubheader key={`${title}-header`}>{title}</ListSubheader>,
    ...models.map((model) => (
      <MenuItem key={model.id} value={model.id}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Typography>{model.name}</Typography>

          <Tooltip
            title={
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  {model.name}
                </Typography>
                <Typography variant="body2">{model.description}</Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontWeight: "bold" }}
                >
                  Pricing:
                </Typography>
                <Typography variant="body2">
                  Input: {model.pricing.input}
                </Typography>
                <Typography variant="body2">
                  Output: {model.pricing.output}
                </Typography>
              </Box>
            }
            placement="right"
            arrow
          >
            <InfoIcon
              fontSize="small"
              sx={{ ml: 1, color: "action.active" }}
            />
          </Tooltip>
        </Box>
      </MenuItem>
    )),
  ];

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      {activeFeature === "ai" ? (
        <>
          {/* AI Model Dropdown */}
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>AI Model</InputLabel>
            <Select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              label="AI Model"
              MenuProps={{
                PaperProps: { style: { maxHeight: 400 } },
              }}
            >
              {[
                ...renderModelSection("DeepSeek Models", deepseekModels),
                ...renderModelSection("ChatGPT Models", chatgptModels),
                ...renderModelSection("Claude Models", claudeModels),
              ]}
            </Select>
          </FormControl>

          {/* Temperature */}
          <TextField
            size="small"
            label="Temperature"
            type="number"
            value={temperature}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val >= 0 && val <= 2) setTemperature(val);
            }}
            inputProps={{ min: 0, max: 2, step: 0.1 }}
            sx={{ width: 120 }}
          />
        </>
      ) : (
        <ToneSelector tone={tone} setTone={setTone} tones={tones} />
      )}
    </Box>
  );
};

export default ModelSelector;