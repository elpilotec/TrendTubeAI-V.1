export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUriDisplayed, setRedirectUriDisplayed] = useState('');  // Nuevo estado para mostrar el redirectUri

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const redirectUri = window.location.href;
        setRedirectUriDisplayed(redirectUri);  // Guardar el redirectUri en el estado

        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();
        onLogin({
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
        });
        navigate('/');
      } catch (error) {
        console.error('Error during login:', error);
        setError('Failed to log in. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
      setError('Login failed. Please try again.');
    },
    flow: 'implicit',
    redirectUri: 'https://www.trendtubeai.com',  // Especificamos el redirectUri para que coincida con Google Cloud Console
  });

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mt: 4, 
      position: 'relative',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
    }}>
      <Typography variant="h6" gutterBottom sx={{ mt: 2, textAlign: 'center' }}>
        Inicia sesión para Acceder a Todas las Funciones
      </Typography>
      <Button
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        onClick={() => login()}
        disabled={isLoading}
        sx={{ 
          mt: 2,
          backgroundColor: '#DB4437',
          '&:hover': {
            backgroundColor: '#C53929',
          },
          '&:disabled': {
            backgroundColor: '#BDBDBD',
          },
        }}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}
      </Button>

      {/* Aquí mostramos el redirectUri temporalmente */}
      <Typography variant="body1" sx={{ mt: 2, color: 'blue' }}>
        Redirect URI: {redirectUriDisplayed}
      </Typography>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}