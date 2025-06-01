import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from 'react-router-dom';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Map path segments to display names
  const getDisplayName = (segment) => {
    switch (segment) {
      case 'app':
        return 'Dashboard';
      case 'dashboard':
        return 'Home';
      case 'reports':
        return 'Reports';
      case 'expenses':
        return 'Expenses';
      case 'homeowners':
        return 'Homeowners';
      case 'billing':
        return 'Billing & Payments';
      case 'admin-register':
        return 'User Roles';
      case 'receipt':
        return 'HO Personal Record';
      default:
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  // Get the current page name
  const currentPage = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : 'dashboard';

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Dashboard</Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {getDisplayName(currentPage)}
      </Typography>
    </StyledBreadcrumbs>
  );
}
