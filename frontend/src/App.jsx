import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { toggleTheme, getPreferredTheme } from './utils/theme';
import './App.css';
import ProductList from './pages/products/ProductList';
import ProductCreate from './pages/products/ProductCreate';
import ProductEdit from './pages/products/ProductEdit';
import AdminDashboard from './pages/admin/AdminDashboard';
import Reviews from './pages/reviews/Reviews';
import Trash from './pages/products/Trash';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Shop from './pages/Shop';
import AuthModal from './components/AuthModal';
import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';
import Profile from './pages/auth/Profile';
import Navbar from './components/Navbar';
import { api } from './utils/api';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Chip,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Reviews as ReviewsIcon,
  Delete as DeleteIcon,
  Brightness4,
  Brightness7
} from '@mui/icons-material';

export default function App() {
  const [mode, setMode] = useState('light');
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  
  useEffect(() => { setMode(getPreferredTheme()); }, []);
  const { checkSession } = useSession(setUser);
  useEffect(() => { checkSession(); }, [checkSession]);
  useEffect(() => { if (!authOpen) { checkSession(); } }, [authOpen, checkSession]);
  
  const { pathname } = useLocation();
  const isDark = mode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const adminRoots = ['/admin', '/products', '/reviews', '/trash', '/categories'];
  const isAdminLayout = adminRoots.some(p => pathname.startsWith(p));
  const isMobile = useMediaQuery('(max-width:900px)');

  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#6366f1',
      },
    },
  });

  const drawerWidth = 260;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { divider: true, label: 'CATALOG' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Products', icon: <InventoryIcon />, path: '/products' },
    { text: 'Add Product', icon: <AddIcon />, path: '/products/new' },
    { divider: true, label: 'MANAGEMENT' },
    { text: 'Reviews', icon: <ReviewsIcon />, path: '/reviews' },
    { text: 'Trash', icon: <DeleteIcon />, path: '/trash' },
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <svg style={{ width: 32, height: 32, color: '#6366f1' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
        </svg>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>animerch</Typography>
          <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <ListItem key={index} sx={{ pt: 2, pb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', px: 2 }}>
                  {item.label}
                </Typography>
              </ListItem>
            );
          }
          const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
  if (isAdminLayout) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
              backgroundColor: isDark ? 'background.paper' : 'white',
              color: 'text.primary',
              boxShadow: 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton onClick={() => setMode(toggleTheme())} sx={{ mr: 1 }}>
                {isDark ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              {user && (
                <Chip
                  avatar={<Avatar src={user.photo?.url}>{!user.photo?.url && user.username?.[0]?.toUpperCase()}</Avatar>}
                  label={user.username || 'User'}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Toolbar>
          </AppBar>
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          >
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              mt: 8,
            }}
          >
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/admin/categories" element={<CategoryList />} />
              <Route path="/admin/categories/create" element={<CategoryForm />} />
              <Route path="/admin/categories/edit/:id" element={<CategoryForm />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<ProductCreate />} />
              <Route path="/products/:id/edit" element={<ProductEdit />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/trash" element={<Trash />} />
            </Routes>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Storefront layout for home and non-admin pages
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <CartProvider>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar
            onToggleTheme={() => setMode(toggleTheme())}
            isDark={isDark}
            onAuthOpen={(view) => { setAuthView(view); setAuthOpen(true); }}
            user={user}
            onLogout={() => { localStorage.removeItem('token'); setUser(null); }}
          />
          <AuthModal open={authOpen} initialView={authView} onClose={() => setAuthOpen(false)} />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/p/:id" element={<ProductDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Box>
          <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3 }}>
            <Container maxWidth="lg">
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} animerch. All rights reserved.
              </Typography>
            </Container>
          </Box>
        </Box>
      </CartProvider>
    </ThemeProvider>
  );
}

// Session check: on load and when auth modal closes
export function useSession(setUser) {
  const checkSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setUser(null); return; }
      const { data } = await api.get('/auth/me');
      setUser(data.user || null);
    } catch (_e) {
      setUser(null);
    }
  }, [setUser]);
  return { checkSession };
}
