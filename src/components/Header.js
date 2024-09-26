import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Avatar, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { AccountCircle, ExitToApp, Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import logo from '../assets/logo.png';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#ff6666',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 16px',
  height: '64px',
});

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
});

const Logo = styled('img')({
  height: '90px',
  marginRight: '8px',
});

const AppName = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  marginLeft: '-25px',
});

const SettingsContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginRight: '16px',
});

const getInitials = (email) => {
  if (!email) return '';
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.map(part => part[0].toUpperCase()).join('');
};

export default function Header({ darkMode, toggleDarkMode, user, onLogout, isPremium }) {
  const initials = user ? getInitials(user.email) : '';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleClose();
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <LogoContainer component={Link} to="/">
          <Logo src={logo} alt="TrendTubeAI Logo" />
          <AppName variant="h6">
            TrendTubeAI
          </AppName>
        </LogoContainer>
        <SettingsContainer>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
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
                PaperProps={{
                  style: {
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  },
                }}
              >
                {user ? (
                  <>
                    <MenuItem>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#ff6666', color: 'white', marginRight: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {initials}
                      </Avatar>
                      <Typography variant="body2">
                        {user.email} {isPremium ? '(PRO)' : '(FREE)'}
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ marginRight: 1 }} />
                      Cerrar sesión
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem component={Link} to="/login">
                    <AccountCircle sx={{ marginRight: 1 }} />
                    Iniciar sesión
                  </MenuItem>
                )}
                <MenuItem onClick={toggleDarkMode}>
                  {darkMode ? <Brightness7 sx={{ marginRight: 1 }} /> : <Brightness4 sx={{ marginRight: 1 }} />}
                  {darkMode ? 'Modo claro' : 'Modo oscuro'}
                </MenuItem>
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
                    <IconButton color="inherit" onClick={onLogout} size="small">
                      <ExitToApp />
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
            </>
          )}
        </SettingsContainer>
      </StyledToolbar>
    </StyledAppBar>
  );
}