import * as React from 'react';
import { keyframes } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
// import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
//import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
// import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import logo from "../../assets/logo/logo.webp";
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice'; // Adjust path to your authSlice file
import NotificationDrawer from './component/NotificationDrawer'; // Import the separate component here
import { useNotifications } from '../../hooks/useNotifications'; // Import notification hook

const settings = [
  { label: 'Profile', icon: <PersonIcon fontSize="small" /> },
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Logout', icon: <LogoutIcon fontSize="small" /> },
];

function ResponsiveAppBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { user, role } = useSelector((state) => state.auth); // Select user and role from auth state
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  
  // Get notifications from hook (for all staff roles)
  const staffRoles = ['receptionist', 'doctor', 'nurse', 'therapist', 'pharmacist'];
  const userRole = role?.toLowerCase() || '';
  const isStaff = userRole && staffRoles.includes(userRole);
  const isReceptionist = userRole === 'receptionist';
  const { paymentReminders, dobReminders } = useNotifications();
  
  // Receptionist gets both payment and DOB reminders, other staff only get DOB reminders
  const totalNotifications = isReceptionist 
    ? ((paymentReminders?.length || 0) + (dobReminders?.length || 0))
    : (dobReminders?.length || 0);
  const hasNotifications = isStaff && totalNotifications > 0;
  
  // Blinking animation state
  const [isBlinking, setIsBlinking] = React.useState(false);
  
  // Define keyframes for blinking animation
  const bellBlink = keyframes`
    0%, 100% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.15);
      opacity: 0.7;
    }
  `;
  
  const badgePulse = keyframes`
    0%, 100% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.3);
      opacity: 0.8;
    }
  `;
  
  // Blink 10 times every 1 minute when there are notifications
  React.useEffect(() => {
    if (!hasNotifications) {
      setIsBlinking(false);
      return;
    }
    
    // Function to trigger 10 blinks in sequence
    const triggerBlinks = () => {
      let blinkCount = 0;
      const blinkDuration = 300; // Each blink animation lasts 0.3 seconds
      const blinkGap = 200; // 200ms gap between each blink
      
      const blinkSequence = () => {
        if (blinkCount < 10) {
          setIsBlinking(true);
          setTimeout(() => {
            setIsBlinking(false);
            blinkCount++;
            if (blinkCount < 10) {
              setTimeout(blinkSequence, blinkGap);
            }
          }, blinkDuration);
        }
      };
      
      blinkSequence();
    };
    
    // Blink immediately when notifications appear
    triggerBlinks();
    
    // Blink 10 times every 1 minute
    const blinkInterval = setInterval(() => {
      triggerBlinks();
    }, 60 * 1000); // Every 1 minute
    
    return () => {
      clearInterval(blinkInterval);
    };
  }, [hasNotifications, totalNotifications]);

  // Scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleUserClose = () => setAnchorElUser(null);

  const handleNotificationToggle = () => {
    setNotificationDrawerOpen((prev) => !prev);
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // Handle menu item clicks
  const handleMenuItemClick = (label) => {
    handleUserClose();

    if (label === 'Logout') {
      dispatch(logout());
      navigate('/');
      return;
    }
    if (label === 'Dashboard') {
      const userRole = role?.toLowerCase() || localStorage.getItem("role")?.toLowerCase();
      if (userRole) {
        navigate(`/${userRole}/dashboard`);
      } else {
        navigate("/login");
      }
      return;
    }

    if (label === 'Profile') {
      const userRole = role?.toLowerCase() || localStorage.getItem("role")?.toLowerCase();
      if (userRole) {
        navigate(`/${userRole}/profile`);
      } else {
        navigate("/login");
      }
      return;
    }

  };

  const logoLink = () => {
    const userRole = role?.toLowerCase() || localStorage.getItem("role")?.toLowerCase();
    navigate(`/${userRole}/dashboard`);

  }

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: 1201,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: scrolled
          ? "var(--color-bg-header-scroll) !important"
          : "var(--color-bg-header) !important",
        color: "var(--color-text-header)",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: "1.5rem", minHeight: { xs: 56, md: 72 } }}>

          {/* LOGO & TITLE SECTION */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexShrink: 0,
            }}
          >
            <Tooltip title="Home">
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                // onClick={() => navigate(`/${userRole}/dashboard`)}   // ⭐ go to home
                onClick={logoLink}   // ⭐ go to home
                sx={{
                  p: 1,
                  borderRadius: 2,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "scale(1.06)",
                    backgroundColor: "rgba(255,255,255,0.12)",
                  },
                }}
              >
                <img
                  src={logo}
                  alt="UTPALA Logo"
                  style={{
                    height: "3rem",
                    width: "auto",
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>

          {/* DESKTOP SIDEBAR TOGGLE */}
          <Tooltip title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleToggleSidebar}
              sx={{
                display: { xs: 'none', md: 'flex' },
                transition: "all 0.2s ease",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)", transform: "scale(1.05)" },
                transform: sidebarOpen ? 'rotate(180deg)' : 'none',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* MOBILE MENU (Toggle Sidebar on Mobile for Consistency) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="toggle sidebar"
              onClick={handleToggleSidebar}
              color="inherit"
              sx={{ ml: "auto" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* DESKTOP NAV (Optional - Add if needed) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} />

          {/* RIGHT SIDE SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>

            {/* Notification Bell Icon - For all staff roles */}
            {isStaff && (
              <>
                <Tooltip title={hasNotifications ? "You have notifications" : "No notifications"}>
                  <IconButton
                    size="large"
                    color="inherit"
                    onClick={handleNotificationToggle}
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)", transform: "scale(1.05)" },
                      // Blinking animation
                      animation: isBlinking ? `${bellBlink} 0.5s ease-in-out` : 'none',
                    }}
                  >
                    <Badge
                      badgeContent={null}
                      invisible={!hasNotifications}
                      color="error"
                      variant="dot"
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#f44336', // Red dot
                          boxShadow: '0 0 0 2px var(--color-bg-header)', // Border to make it pop
                          // Blinking animation for badge (10 times)
                          animation: isBlinking ? `${badgePulse} 0.5s ease-in-out` : 'none',
                        },
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Single Call to the Separate Component - Handles Display on Click */}
                <NotificationDrawer
                  open={notificationDrawerOpen}
                  onClose={() => setNotificationDrawerOpen(false)}
                  paymentReminders={paymentReminders}
                  dobReminders={dobReminders}
                />
              </>
            )}

            {/* USER INFO - Dynamic with Redux State */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: "column", textAlign: "right", lineHeight: "1rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", opacity: 0.7 }}>
                {role || 'Role'}
              </Typography>
            </Box>

            {/* AVATAR MENU */}
            <Tooltip title="Open settings">
              <IconButton
                onClick={(e) => setAnchorElUser(e.currentTarget)}
                sx={{
                  p: 0,
                  transition: "all 0.2s ease",
                  "&:hover": { "& .MuiAvatar-root": { transform: "scale(1.1)" } },
                }}
              >
                <Avatar
                  alt={user?.name || 'User'}
                  src={user?.avatar || "/static/images/avatar/2.jpg"}
                  sx={{
                    width: 40,
                    height: 40,
                    transition: "all 0.2s ease",
                    border: "1px solid var(--color-light)",
                    bgcolor: "var(--color-bg-profile)",
                  }}
                />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleUserClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                mt: 0.5,
                '& .MuiPaper-root': { minWidth: 180 },
              }}
            >
              {settings.map(({ label, icon }) => (
                <MenuItem
                  key={label}
                  onClick={() => handleMenuItemClick(label)}
                  sx={{
                    gap: 1,
                    transition: "all 0.2s ease",
                    '&:hover': { backgroundColor: "rgba(var(--color-primary-rgb), 0.1)" },
                  }}
                >
                  {icon}
                  <Typography variant="body2">{label}</Typography>
                </MenuItem>
              ))}
            </Menu>

          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;