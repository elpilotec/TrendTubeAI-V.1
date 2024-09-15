import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff6666',  // Rojo claro
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#000',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6666',  // Rojo claro en modo oscuro también
    },
    background: {
      default: '#121212',
      paper: '#121212',
    },
    text: {
      primary: '#fff',
    },
  },
});
