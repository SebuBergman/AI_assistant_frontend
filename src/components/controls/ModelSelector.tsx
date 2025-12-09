import { FormControl, Select, Tooltip, Box, Typography, InputLabel, ListSubheader, MenuItem } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface Model {
  id: string;
  name: string;
  description: string;
  pricing: {
    input: string;
    output: string;
  };
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  deepseekModels: Model[];
  chatgptModels: Model[];
  claudeModels: Model[];
}

export const ModelSelector = ({
  selectedModel,
  onModelChange,
  deepseekModels,
  chatgptModels,
  claudeModels,
}: ModelSelectorProps) => {
  return (
    <FormControl size="small" sx={{ minWidth: 250 }}>
      <InputLabel>AI Model</InputLabel>
      <Select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        label="AI Model"
        MenuProps={{
          PaperProps: {
            style: { maxHeight: 400 },
          },
        }}
      >
        <ListSubheader>DeepSeek Models</ListSubheader>
        {deepseekModels.map((model) => (
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
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {model.name}
                    </Typography>
                    <Typography variant="body2">{model.description}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
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
                <InfoIcon fontSize="small" sx={{ ml: 1, color: "action.active" }} />
              </Tooltip>
            </Box>
          </MenuItem>
        ))}
        
        <ListSubheader>ChatGPT Models</ListSubheader>
        {chatgptModels.map((model) => (
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
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {model.name}
                    </Typography>
                    <Typography variant="body2">{model.description}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
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
                <InfoIcon fontSize="small" sx={{ ml: 1, color: "action.active" }} />
              </Tooltip>
            </Box>
          </MenuItem>
        ))}
        
        <ListSubheader>Claude Models</ListSubheader>
        {claudeModels.map((model) => (
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
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {model.name}
                    </Typography>
                    <Typography variant="body2">{model.description}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
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
                <InfoIcon fontSize="small" sx={{ ml: 1, color: "action.active" }} />
              </Tooltip>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};