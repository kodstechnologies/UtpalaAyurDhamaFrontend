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
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import logo from "../../assets/logo/utpala_logo.png";

const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [scrolled, setScrolled] = React.useState(false);

  // scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: 1201,
        transition: "all 0.3s ease",
        backgroundColor: scrolled
          ? "var(--color-primary) !important"
          : "var(--color-bg-header) !important",
        color: "var(--color-text-header)",
        boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: "1.2rem" }}>

          {/* LOGO */}
          <img src={logo} alt="logo" style={{ height: "2.5rem" }} />

          {/* NAME TITLE */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'serif',
              fontWeight: 700,
              letterSpacing: '.2rem',
              textDecoration: 'none',
              color: "inherit",
            }}
          >
            UTPALA
          </Typography>

          {/* CALENDAR ICON */}
          <CalendarViewDayIcon sx={{ display: { xs: "none", md: "flex" } }} />

          {/* MOBILE MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" color="inherit" onClick={(e) => setAnchorElNav(e.currentTarget)}>
              <MenuIcon />
            </IconButton>

            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={() => setAnchorElNav(null)}>
              <MenuItem onClick={() => setAnchorElNav(null)}>
                <Typography>Dashboard</Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* SPACE FOR FLEX */}
          <Box sx={{ flexGrow: 1 }} />

          {/* RIGHT SIDE SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>

            {/* NOTIFICATION */}
            <CircleNotificationsIcon sx={{ cursor: "pointer" }} />

            {/* USER INFO */}
            <Box sx={{ textAlign: "right", lineHeight: "1rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Sangram</Typography>
              <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>Admin</Typography>
            </Box>

            {/* AVATAR MENU */}
            <Tooltip title="Open settings">
              <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                <Avatar alt="User" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => setAnchorElUser(null)}>
                  <Typography>{setting}</Typography>
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
