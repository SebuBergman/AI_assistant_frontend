'use client';

import {
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Email,
  Psychology,
  SettingsSuggest,
  Storage,
  FlashOn,
  Brightness7,
  Brightness4,
} from "@mui/icons-material";

interface TopBarProps {
  activeFeature: "email" | "ai";
  setActiveFeature: (val: "email" | "ai") => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isRagEnabled: boolean;
  setIsRagEnabled: (v: boolean) => void;
  isTemporaryChat: boolean;
  toggleTemporaryChat: () => void;
  mode: "light" | "dark" | "system";
  setMode: (m: "light" | "dark" | "system") => void;
}

export default function TopBar({
  activeFeature,
  setActiveFeature,
  sidebarOpen,
  setSidebarOpen,
  isRagEnabled,
  setIsRagEnabled,
  isTemporaryChat,
  toggleTemporaryChat,
  mode,
  setMode,
}: TopBarProps) {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {/* Sidebar Toggle */}
        <IconButton
          edge="start"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo / Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 3 }}>
          <SettingsSuggest color="primary" />
          <Typography variant="h6" fontWeight="bold">
            AI Assistant
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeFeature === "email" ? 0 : 1}
          onChange={(_, newValue) =>
            setActiveFeature(newValue === 0 ? "email" : "ai")
          }
          sx={{ flex: 1 }}
        >
          <Tab icon={<Email />} iconPosition="start" label="Email Assistant" />
          <Tab icon={<Psychology />} iconPosition="start" label="AI Chat" />
        </Tabs>

        {/* RAG + Temp Chat Toggles (Only in AI Chat mode) */}
        {activeFeature === "ai" && (
          <>
            {/* RAG Toggle */}
            <Tooltip title={isRagEnabled ? "Disable RAG" : "Enable RAG"}>
              <IconButton
                onClick={() => setIsRagEnabled(!isRagEnabled)}
                sx={{
                  bgcolor: isRagEnabled ? "success.main" : "action.hover",
                  color: isRagEnabled ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: isRagEnabled
                      ? "success.dark"
                      : "action.selected",
                  },
                  transition: "all 0.2s",
                }}
              >
                <Storage />
              </IconButton>
            </Tooltip>

            {/* Temporary Chat Toggle */}
            <Tooltip
              title={
                isTemporaryChat
                  ? "Disable Temporary Chat"
                  : "Enable Temporary Chat"
              }
            >
              <IconButton
                onClick={toggleTemporaryChat}
                sx={{
                  ml: 1,
                  bgcolor: isTemporaryChat ? "warning.main" : "action.hover",
                  color: isTemporaryChat ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: isTemporaryChat
                      ? "warning.dark"
                      : "action.selected",
                  },
                  transition: "all 0.2s",
                }}
              >
                <FlashOn />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* Dark Mode Toggle */}
        <IconButton
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        >
          {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}