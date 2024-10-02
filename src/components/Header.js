import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, useMediaQuery, useTheme, Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { AccountCircle, ExitToApp, Menu as MenuIcon, Brightness4, Brightness7, Close as CloseIcon, Bookmark as BookmarkIcon } from '@mui/icons-material';
import logo from '../assets/logo.png';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#ff6666',
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const LogoContainer = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
});

const Logo = styled('img')({
  height: '50px',
  marginRight: '10px',
});

const SettingsContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginRight: '10px',
});

export default function Header({ darkMode, toggleDarkMode, user, onLogout, isPremium }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <LogoContainer to="/">
          <Logo src={logo} alt="TrendTube AI Logo" />
          <Typography variant="h6" component="div">
            TrendTube AI
          </Typography>
        </LogoContainer>
        <SettingsContainer>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {user && (
                  <MenuItem onClick={handleClose}>
                    <Avatar sx={{ mr: 2 }}>{initials}</Avatar>
                    <ListItemText primary={user.name} secondary={isPremium ? '(PRO)' : '(FREE)'} />
                  </MenuItem>
                )}
                {isPremium && (
                  <MenuItem component={Link} to="/saved-ideas" onClick={handleClose}>
                    <ListItemIcon>
                      <BookmarkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Ideas Guardadas" />
                  </MenuItem>
                )}
                <MenuItem onClick={toggleDarkMode}>
                  <ListItemIcon>
                    {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={darkMode ? "Modo Claro" : "Modo Oscuro"} />
                </MenuItem>
                {user ? (
                  <MenuItem onClick={onLogout}>
                    <ListItemIcon>
                      <ExitToApp fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                  </MenuItem>
                ) : (
                  <MenuItem component={Link} to="/login" onClick={handleClose}>
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Iniciar Sesión" />
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <>
              <UserInfo>
                {user ? (
                  <>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'white', color: '#ff6666', marginRight: 1, fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {initials}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', marginRight: 1, color: 'white' }}>
                      {isPremium ? '(PRO)' : '(FREE)'}
                    </Typography>
                    <IconButton color="inherit" onClick={onLogout} size="small" sx={{ marginLeft: 1 }}>
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <Button 
                    color="inherit" 
                    startIcon={<AccountCircle />} 
                    component={Link} 
                    to="/login"
                    sx={{ color: 'white', textTransform: 'none' }}
                  >
                    Iniciar sesión
                  </Button>
                )}
              </UserInfo>
              <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              {isPremium && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/saved-ideas"
                  startIcon={<BookmarkIcon />}
                >
                  Ideas Guardadas
                </Button>
              )}
            </>
          )}
        </SettingsContainer>
      </StyledToolbar>
    </StyledAppBar>
  );
}