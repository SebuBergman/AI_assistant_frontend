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
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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
}

export default function ChatSidebar({
  sidebarOpen,
  currentChatId,
  onChatSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats', {
        headers: {
          'x-user-id': getUserId(), // Your auth logic here
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch chats');
      
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChatId(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChatId(null);
  };

  const handleDeleteChat = async () => {
    if (!selectedChatId) return;
    
    try {
      const response = await fetch(`/api/chats/${selectedChatId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': getUserId(),
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete chat');
      
      // Remove from local state
      setChats(chats.filter(chat => chat.id !== selectedChatId));
      
      // If we deleted the current chat, trigger new chat
      if (currentChatId === selectedChatId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      handleMenuClose();
    }
  };

  const handleEditChat = () => {
    if (!selectedChatId) return;
    
    const chat = chats.find(c => c.id === selectedChatId);
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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId(),
        },
        body: JSON.stringify({ title: editTitle }),
      });
      
      if (!response.ok) throw new Error('Failed to update chat');
      
      // Update local state
      setChats(chats.map(chat =>
        chat.id === chatId ? { ...chat, title: editTitle } : chat
      ));
    } catch (error) {
      console.error('Error updating chat:', error);
    } finally {
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Helper to get user ID - replace with your auth logic
  const getUserId = () => {
    // This should come from your auth system
    // For now, using localStorage as example
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? 260 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          bgcolor: '#1a1a1a',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          fullWidth
          onClick={handleNewChat}
          sx={{
            mb: 2,
            justifyContent: 'flex-start',
            color: 'white',
            borderColor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.3)',
              bgcolor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          New Chat
        </Button>

        <Typography
          variant="caption"
          sx={{ px: 1, mb: 1, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
        >
          CHAT HISTORY
        </Typography>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} sx={{ color: 'rgba(255,255,255,0.3)' }} />
            </Box>
          ) : chats.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ px: 1, py: 2, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}
            >
              No saved chats yet
            </Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {chats.map((chat) => (
                <ListItem
                  key={chat.id}
                  disablePadding
                  secondaryAction={
                    editingChatId !== chat.id && (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => handleMenuOpen(e, chat.id)}
                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                  sx={{ mb: 0.5 }}
                >
                  {editingChatId === chat.id ? (
                    <Box sx={{ width: '100%', px: 1 }}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(chat.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        onBlur={() => handleSaveEdit(chat.id)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: '14px',
                        }}
                      />
                    </Box>
                  ) : (
                    <ListItemButton
                      selected={currentChatId === chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      sx={{
                        borderRadius: 1,
                        '&.Mui-selected': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={chat.title}
                        secondary={formatDate(chat.updatedAt)}
                        primaryTypographyProps={{
                          noWrap: true,
                          sx: {
                            color: 'white',
                            fontSize: '0.875rem',
                          },
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.75rem',
                          },
                        }}
                      />
                    </ListItemButton>
                  )}
                </ListItem>
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
            bgcolor: '#2a2a2a',
            color: 'white',
          },
        }}
      >
        <MenuItem onClick={handleEditChat}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDeleteChat} sx={{ color: '#ff6b6b' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Drawer>
  );
}