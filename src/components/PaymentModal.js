import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const PaymentModal = ({ open, onClose, onSubmit }) => {
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'credit',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    paypalEmail: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(paymentDetails);
    onClose();
  };

  const renderPaymentFields = () => {
    switch (paymentDetails.paymentMethod) {
      case 'credit':
      case 'debit':
        return (
          <>
            <TextField
              name="cardNumber"
              label="Número de tarjeta"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              name="expirationDate"
              label="Fecha de expiración (MM/AA)"
              value={paymentDetails.expirationDate}
              onChange={handleChange}
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              name="cvv"
              label="CVV"
              value={paymentDetails.cvv}
              onChange={handleChange}
              fullWidth
              margin="dense"
              size="small"
            />
          </>
        );
      case 'paypal':
        return (
          <>
            <TextField
              name="paypalEmail"
              label="Correo electrónico de PayPal"
              value={paymentDetails.paypalEmail}
              onChange={handleChange}
              fullWidth
              margin="dense"
              size="small"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
              Serás redirigido a PayPal para completar el pago.
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          margin: isMobile ? '0' : 'auto',
          width: isMobile ? '100%' : 'auto',
          maxWidth: isMobile ? '100%' : '400px',
          height: isMobile ? '100%' : 'auto',
          maxHeight: isMobile ? '100%' : 'none',
          borderRadius: isMobile ? '0' : '4px',
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? '0' : 'auto',
          left: isMobile ? '0' : 'auto',
          right: isMobile ? '0' : 'auto',
          bottom: isMobile ? '0' : 'auto',
          transform: 'none',
        }
      }}
    >
      <DialogTitle sx={{ fontSize: '1.25rem', py: 1.5, px: 2 }}>
        Agregar método de pago
      </DialogTitle>
      <DialogContent sx={{ pb: 1, px: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="payment-method-label">Método de pago</InputLabel>
            <StyledSelect
              labelId="payment-method-label"
              name="paymentMethod"
              value={paymentDetails.paymentMethod}
              onChange={handleChange}
              label="Método de pago"
            >
              <MenuItem value="credit">Tarjeta de crédito</MenuItem>
              <MenuItem value="debit">Tarjeta de débito</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
            </StyledSelect>
          </FormControl>
          {renderPaymentFields()}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2, flexDirection: 'column', alignItems: 'stretch' }}>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mb: 1, py: 1 }}
        >
          Confirmar pago
        </Button>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          fullWidth
          sx={{ py: 1 }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;