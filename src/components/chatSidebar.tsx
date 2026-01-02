import { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  useTheme,
  Collapse,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteDialog from "./shared/DeleteDialog";
import { getUserId } from "@/lib/auth";

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  sidebarOpen: boolean;
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  refreshTrigger?: number;
}

export default function ChatSidebar({
  sidebarOpen,
  currentChatId,
  onChatSelect,
  onNewChat,
  refreshTrigger,
}: ChatSidebarProps) {
  const theme = useTheme();
  const userId = getUserId();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    chatId: string | null;
    chatTitle: string;
  }>({
    open: false,
    chatId: null,
    chatTitle: '',
  });
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, [refreshTrigger]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chats", {
        headers: {
          "x-user-id": userId,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch chats");

      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    onNewChat();
  };

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    chatId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChatId(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChatId(null);
  };

  // Functions for delete dialog
    const handleDeleteClick = (chatId: string, chatTitle: string) => {
      setDeleteDialog({
        open: true,
        chatId,
        chatTitle,
      });
    };

    const getDeleteMessage = () => {
      return `Are you sure you want to delete this chat with the title: "${deleteDialog.chatTitle}"?\nThis cannot be undone.`;
    };
  
    const handleDeleteConfirm = async () => {
      if (!deleteDialog.chatId) return;

      const chatId = deleteDialog.chatId;

      try {
        // start animation
        setDeletingChatId(chatId);

        const response = await fetch(`/api/chats/${chatId}`, {
          method: "DELETE",
          headers: {
            "x-user-id": userId,
          },
        });

        if (!response.ok) throw new Error("Failed to delete chat");

        // wait for animation to finish
        setTimeout(() => {
          setChats(chats => chats.filter(chat => chat.id !== chatId));
          setDeletingChatId(null);
        }, 300); // match animation duration

        if (currentChatId === chatId) {
          onNewChat();
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
        setDeletingChatId(null);
      } finally {
        setDeleteDialog({ open: false, chatId: null, chatTitle: '' });
      }
    };

  const handleEditChat = () => {
    if (!selectedChatId) return;

    const chat = chats.find((c) => c.id === selectedChatId);
    if (chat) {
      setEditingChatId(selectedChatId);
      setEditTitle(chat.title);
    }
    handleMenuClose();
  };

  const handleSaveEdit = async (chatId: string) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) throw new Error("Failed to update chat");

      setChats(
        chats.map((chat) =>
          chat.id === chatId ? { ...chat, title: editTitle } : chat
        )
      );
    } catch (error) {
      console.error("Error updating chat:", error);
    } finally {
      setEditingChatId(null);
      setEditTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? 260 : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 260,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box
        sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          fullWidth
          onClick={handleNewChat}
          sx={{
            mb: 2,
            justifyContent: "flex-start",
            color: "text.primary",
            borderColor: "divider",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "action.hover",
            },
          }}
        >
          New Chat
        </Button>

        <Typography
          variant="caption"
          sx={{
            px: 1,
            mb: 1,
            color: "text.secondary",
            fontWeight: 600,
          }}
        >
          CHAT HISTORY
        </Typography>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : chats.length === 0 ? (
            <Typography
              variant="body2"
              sx={{
                px: 1,
                py: 2,
                textAlign: "center",
                color: "text.disabled",
              }}
            >
              No saved chats yet
            </Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {chats.map((chat) => (
                <Collapse
                  key={chat.id}
                  in={deletingChatId !== chat.id}
                  timeout={300}
                  unmountOnExit
                >
                  <ListItem
                    disablePadding
                    secondaryAction={
                      editingChatId !== chat.id && (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => handleMenuOpen(e, chat.id)}
                          sx={{ color: "text.secondary" }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )
                    }
                    sx={{ mb: 0.5 }}
                  >
                    {editingChatId === chat.id ? (
                      <Box sx={{ width: "100%", px: 1 }}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(chat.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          onBlur={() => handleSaveEdit(chat.id)}
                          autoFocus
                          style={{
                            width: "100%",
                            padding: "8px",
                            background:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "4px",
                            color: theme.palette.text.primary,
                            fontSize: "14px",
                          }}
                        />
                      </Box>
                    ) : (
                      <ListItemButton
                        selected={currentChatId === chat.id}
                        onClick={() => handleChatClick(chat.id)}
                        sx={{
                          borderRadius: 1,
                          "&.Mui-selected": {
                            bgcolor: "action.selected",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          },
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <ListItemText
                          primary={chat.title}
                          secondary={formatDate(chat.updatedAt)}
                          primaryTypographyProps={{
                            noWrap: true,
                            sx: {
                              color: "text.primary",
                              fontSize: "0.875rem",
                            },
                          }}
                          secondaryTypographyProps={{
                            sx: {
                              color: "text.secondary",
                              fontSize: "0.75rem",
                            },
                          }}
                        />
                      </ListItemButton>
                    )}
                  </ListItem>
                </Collapse>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        <MenuItem onClick={handleEditChat}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            const chat = chats.find((c) => c.id === selectedChatId);
            if (chat) {
              handleDeleteClick(chat.id, chat.title);
            }
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      <DeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
        onConfirm={handleDeleteConfirm}
        fileName={deleteDialog.chatTitle}
        message={getDeleteMessage()}
      />
    </Drawer>
  );
}
