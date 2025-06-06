import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

const HomeownerAuditLogs = ({ open, onClose }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchAuditLogs();
    }
  }, [open]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching audit logs from:', 'http://localhost:8000/homeowners/logs/audit');
      const response = await fetch('http://localhost:8000/homeowners/logs/audit');
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch audit logs');
      }
      const data = await response.json();
      console.log('Received data:', data);
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError(error.message);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          padding: '1rem',
        },
      }}
    >
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        Homeowner Activity Logs
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography sx={{ textAlign: 'center', py: 2 }}>Loading...</Typography>
        ) : error ? (
          <Typography sx={{ textAlign: 'center', py: 2, color: 'error.main' }}>
            {error}
          </Typography>
        ) : auditLogs.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 2 }}>
            No activity logs found
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Homeowner</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography
                        sx={{
                          color:
                            log.action === 'CREATE'
                              ? 'success.main'
                              : log.action === 'UPDATE'
                              ? 'warning.main'
                              : 'error.main',
                          fontWeight: 'medium',
                        }}
                      >
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.homeownerName}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#020140',
            '&:hover': {
              backgroundColor: '#0A0A6B',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HomeownerAuditLogs; 