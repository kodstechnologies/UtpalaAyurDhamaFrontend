import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'; // For read notifications
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import logo from "../../assets/logo/utpala_logo.png";
import { Link } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const settings = [
  { label: 'Profile', icon: <PersonIcon fontSize="small" /> },
  { label: 'Account', icon: <AccountCircleIcon fontSize="small" /> },
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Logout', icon: <LogoutIcon fontSize="small" /> },
];

// Mock notifications data - replace with real API fetch
const mockNotifications = [
  {
    id: 1,
    title: 'New Patient Admission',
    description: 'John Doe has been admitted to Ward 5.',
    time: '2 min ago',
    unread: true,
    type: 'admission',
  },
  {
    id: 2,
    title: 'Appointment Reminder',
    description: 'Dr. Smith\'s consultation slot is upcoming.',
    time: '1 hour ago',
    unread: false,
    type: 'appointment',
  },
  {
    id: 3,
    title: 'Inventory Low Stock',
    description: 'Paracetamol stock is below threshold.',
    time: '3 hours ago',
    unread: true,
    type: 'inventory',
  },
  {
    id: 4,
    title: 'System Update Available',
    description: 'Update to version 2.1.3 is ready.',
    time: 'Yesterday',
    unread: false,
    type: 'system',
  },
];

function ResponsiveAppBar({ pageTitle = '' }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = React.useState(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [unreadNotifications, setUnreadNotifications] = React.useState(2); // Dynamic based on mock data

  // Scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClose = () => setAnchorElNav(null);
  const handleUserClose = () => setAnchorElUser(null);
  const handleNotificationsOpen = (event) => setAnchorElNotifications(event.currentTarget);
  const handleNotificationsClose = () => setAnchorElNotifications(null);

  const handleNotificationClick = (notification) => {
    if (notification.unread) {
      // Simulate marking as read - update state
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    }
    // Here, you could navigate or trigger an action
    console.log('Notification clicked:', notification);
    handleNotificationsClose();
  };

  const notifications = mockNotifications.map((notif) => ({
    ...notif,
    unread: notif.unread && unreadNotifications > 0, // Sync with count
  }));

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: 1201,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: scrolled
          ? "var(--color-primary) !important"
          : "var(--color-bg-header) !important",
        color: "var(--color-text-header)",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: "1.5rem", minHeight: { xs: 56, md: 72 } }}>

          {/* LOGO & TITLE SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            <Tooltip title="Home">
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "scale(1.05)", backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                <img src={logo} alt="UTPALA Logo" style={{ height: "2.2rem", width: "auto" }} />
              </IconButton>
            </Tooltip>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'serif',
                fontWeight: 800,
                letterSpacing: '.15rem',
                color: "inherit",
                textDecoration: 'none',
                transition: "color 0.2s ease",
                mr: 2,
              }}
            >
              UTPALA
            </Typography>
          </Box>

          {/* PAGE TITLE */}
          {pageTitle && (
            <Typography
              variant="h6"
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexGrow: 1,
                fontWeight: 600,
                color: "inherit",
                ml: 2,
              }}
            >
              {pageTitle}
            </Typography>
          )}

          {/* CALENDAR ICON */}
          <Tooltip title="Calendar">
            <IconButton
              size="large"
              color="inherit"
              sx={{
                display: { xs: "none", md: "flex" },
                transition: "all 0.2s ease",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)", transform: "rotate(5deg)" },
              }}
            >
              <KeyboardArrowLeftIcon />
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>

          {/* MOBILE MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(e) => setAnchorElNav(e.currentTarget)}
              color="inherit"
              sx={{ ml: "auto" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleNavClose}
              sx={{
                mt: 1,
                '& .MuiPaper-root': { minWidth: 200 },
              }}
            >
              {settings.slice(0, -1).map(({ label, icon }) => ( // Exclude Logout from mobile
                <MenuItem key={label} onClick={handleNavClose}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {icon}
                    {label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* DESKTOP NAV (Optional - Add if needed) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} />

          {/* RIGHT SIDE SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>

            {/* NOTIFICATION WITH BADGE - Updated to "ball icon" (CircleNotifications) */}
            <Tooltip title={`${unreadNotifications} unread notifications`}>
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotificationsOpen}
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)", transform: "scale(1.05)" },
                }}
              >
                <Badge
                  variant="dot"
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      height: "10px",
                      minWidth: "10px",
                      borderRadius: "50%",
                    }
                  }}
                >
                  <CircleNotificationsIcon />
                </Badge>

              </IconButton>
            </Tooltip>

            {/* NOTIFICATIONS POPOVER CARD */}
            <Popover
              open={Boolean(anchorElNotifications)}
              anchorEl={anchorElNotifications}
              onClose={handleNotificationsClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{
                mt: 1,
                "& .MuiPopover-paper": {
                  width: 360,
                  maxWidth: "92vw",
                  maxHeight: 420,
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  bgcolor: "var(--color-bg-card)",
                  border: `1px solid var(--color-border)`,
                }}
              >
                <CardContent sx={{ p: 0 }}>

                  {/* Header (Simplified) */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "var(--color-primary)",
                      color: "var(--color-text-white)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, fontSize: "1.05rem" }}
                    >
                      Notifications
                    </Typography>
                  </Box>

                  {/* Notification List */}
                  <List
                    sx={{
                      p: 0,
                      maxHeight: 350,
                      overflowY: "auto",

                      /* remove horizontal scroll completely */
                      overflowX: "hidden",

                      "&::-webkit-scrollbar": {
                        width: "4px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "var(--color-text-muted)",
                        borderRadius: "4px",
                      },
                    }}
                  >
                    {notifications.map((notification) => (
                      <ListItem
                        key={notification.id}
                        button
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          alignItems: "flex-start",
                          px: 2,
                          py: 1.5,
                          borderBottom: `1px solid var(--color-border)`,

                          bgcolor: notification.unread
                            ? "rgba(205,152,125,0.12)"
                            : "transparent",

                          transition: "background 0.25s ease",
                          "&:hover": {
                            bgcolor: "rgba(205,152,125,0.22)",
                          },
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        {/* Unread Dot */}
                        <ListItemAvatar sx={{ minWidth: 42 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: notification.unread
                                ? "var(--color-primary)"
                                : "var(--color-text-muted)",
                              mt: 0.5,
                            }}
                          />
                        </ListItemAvatar>

                        {/* Text Content */}
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "var(--color-text-dark)",
                              }}
                            >
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "var(--color-text-muted)",
                                  display: "block",
                                  fontSize: "0.77rem",
                                }}
                              >
                                {notification.description}
                              </Typography>

                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                                <AccessTimeIcon
                                  fontSize="inherit"
                                  sx={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "var(--color-text-muted)",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  {notification.time}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}

                    {notifications.length === 0 && (
                      <ListItem sx={{ justifyContent: "center", py: 3 }}>
                        <ListItemText
                          primary="No notifications"
                          secondary="You're all caught up!"
                          sx={{
                            textAlign: "center",
                            color: "var(--color-text-muted)",
                          }}
                        />
                      </ListItem>
                    )}
                  </List>

                </CardContent>
              </Card>
            </Popover>


            {/* USER INFO */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: "column", textAlign: "right", lineHeight: "1rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                Sangram
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", opacity: 0.7 }}>
                Admin
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
                  alt="Sangram"
                  src="/static/images/avatar/2.jpg"
                  sx={{
                    width: 40,
                    height: 40,
                    transition: "all 0.2s ease",
                    bgcolor: "var(--color-primary)",
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
                  onClick={handleUserClose}
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