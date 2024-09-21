import React from 'react';
import { AppBar, Toolbar, Typography, Switch, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ff6666',
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

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: theme.palette.common.white,
  },
}));

const Header = ({ darkMode, toggleDarkMode }) => {
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
          <StyledSwitch
            checked={darkMode}
            onChange={toggleDarkMode}
            inputProps={{ 'aria-label': 'toggle dark mode' }}
          />
          <Typography variant="body2" sx={{ marginLeft: 1, fontWeight: 'bold' }}>
            {darkMode ? 'ON' : 'OFF'}
          </Typography>
        </SettingsContainer>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Header;