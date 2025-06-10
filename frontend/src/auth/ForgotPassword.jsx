import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'mui-sonner';
import { API_BASE_URL } from "../config";

function ForgotPassword({ open, handleClose }) {
  const [email, setEmail] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessDialogOpen(true);
        setEmail('');
      } else {
        toast.error(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit,
          sx: { 
            backgroundImage: 'none',
            borderRadius: '20px',
            padding: '1rem'
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Reset password
        </DialogTitle>
        <DialogContent
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            width: '100%',
            padding: '1rem 0'
          }}
        >
          <DialogContentText>
            Enter your account&apos;s email address, and we&apos;ll send you a link to
            reset your password.
          </DialogContentText>
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="Email address"
            placeholder="Email address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button 
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            sx={{
              backgroundColor: "#020140",
              '&:hover': {
                backgroundColor: "#0A0A6B",
              }
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        PaperProps={{
          sx: { 
            backgroundImage: 'none',
            borderRadius: '20px',
            padding: '1rem'
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Check Your Email
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button 
            onClick={handleSuccessDialogClose}
            variant="contained"
            sx={{
              backgroundColor: "#020140",
              '&:hover': {
                backgroundColor: "#0A0A6B",
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
