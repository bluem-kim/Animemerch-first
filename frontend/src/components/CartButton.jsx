import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Stack, TextField } from '@mui/material';
import { ShoppingCart, Delete, Remove, Add } from '@mui/icons-material';
import { useCart } from '../context/CartContext';

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)} aria-label="cart">
        <Badge badgeContent={cart.totalItems} color="primary">
          <ShoppingCart />
        </Badge>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700}>Your Cart</Typography>
          </Box>
          <Divider />
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {cart.items.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">Your cart is empty.</Typography>
              </Box>
            ) : (
              <List>
                {cart.items.map((item) => (
                  <ListItem key={item.product} alignItems="flex-start" secondaryAction={
                    <IconButton edge="end" aria-label="remove" onClick={() => cart.remove(item.product)}>
                      <Delete />
                    </IconButton>
                  }>
                    <ListItemAvatar>
                      <Avatar variant="rounded" src={item.photoUrl} alt={item.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600} noWrap>{item.name}</Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="body2">₱{Number(item.price).toFixed(2)}</Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton size="small" onClick={() => cart.updateQty(item.product, Math.max(1, item.quantity - 1))}><Remove fontSize="small" /></IconButton>
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value || 1));
                              cart.updateQty(item.product, val);
                            }}
                            sx={{ width: 60 }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center' } }}
                          />
                          <IconButton size="small" onClick={() => cart.updateQty(item.product, item.quantity + 1)}><Add fontSize="small" /></IconButton>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={700}>₱{cart.subtotal.toFixed(2)}</Typography>
            </Stack>
            <Button fullWidth variant="contained" disabled={cart.items.length === 0} onClick={handleCheckout}>
              Checkout (COD)
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
