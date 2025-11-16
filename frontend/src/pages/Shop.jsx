import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, Box, TextField, Button, Card, CardMedia, CardContent, Typography, 
  Chip, CircularProgress, Grid, Paper, Select, MenuItem, FormControl, 
  IconButton, Skeleton, InputAdornment, Divider
} from '@mui/material';
import { ArrowForward, Search, FilterList } from '@mui/icons-material';
import { api } from '../utils/api';
import { getColorValue, getContrastText } from '../utils/colors';

function Reveal({ children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setShown(true);
      });
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      transition: 'opacity .4s ease, transform .4s ease',
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : 'translateY(10px)'
    }}>
      {children}
    </div>
  );
}

function ProductCard({ p }) {
  const img = p?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop';
  return (
    <Reveal>
      <Card 
        sx={{ 
          height: '100%',
          minHeight: 420,
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardMedia
          component={Link}
          to={`/p/${p._id}`}
          sx={{ 
            display: 'block',
            height: 280,
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            '& img': {
              transition: 'transform 0.3s ease'
            },
            '&:hover img': {
              transform: 'scale(1.05)'
            }
          }}
        >
          <Box
            component="img"
            src={img}
            alt={p.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </CardMedia>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <Typography variant="body2" fontWeight={500} noWrap sx={{ flexGrow: 1 }}>
              {p.name}
            </Typography>
            <Chip 
              label={`₱${Number(p.price).toFixed(2)}`} 
              size="small" 
              color="primary"
              sx={{ fontWeight: 600, flexShrink: 0 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 32 }}>
            {p.description || 'Beautiful hand-crafted item.'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {p.category || 'General'}
            </Typography>
            <Button 
              component={Link} 
              to={`/p/${p._id}`} 
              size="small" 
              endIcon={<ArrowForward fontSize="small" />}
            >
              View
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Reveal>
  );
}

export default function Shop() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [minPrice, setMinPrice] = useState(params.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('max') || '');
  const [color, setColor] = useState(params.get('color') || '');
  const [sort, setSort] = useState(params.get('sort') || 'new'); // new, price-asc, price-desc

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cats, setCats] = useState([]);
  const [colors, setColors] = useState([]);

  const syncUrl = useCallback((next = {}) => {
    const sp = new URLSearchParams(location.search);
    const apply = (k, v) => { if (v) sp.set(k, v); else sp.delete(k); };
    apply('q', next.q ?? q);
    apply('category', next.category ?? category);
    apply('min', next.minPrice ?? minPrice);
    apply('max', next.maxPrice ?? maxPrice);
    apply('sort', next.sort ?? sort);
    apply('color', next.color ?? color);
    navigate(`/shop?${sp.toString()}`, { replace: true });
  }, [q, category, minPrice, maxPrice, sort, color, location.search, navigate]);

  const buildParams = (pageNum) => {
    const p = { page: pageNum, limit: 12, activeCategoriesOnly: true };
    if (q) p.search = q;
    if (category) p.category = category;
    if (minPrice) p.minPrice = Number(minPrice);
    if (maxPrice) p.maxPrice = Number(maxPrice);
    if (color) p.color = color;
    // sort is client-side for now except createdAt (default desc)
    return p;
  };

  const fetchPage = useCallback(async (pageNum) => {
    const res = await api.get('/products', { params: buildParams(pageNum) });
    const batch = res.data.items || [];
    return { batch, totalPages: res.data.totalPages || 1 };
  }, [q, category, minPrice, maxPrice, color]);

  // Initial/filters change load
  useEffect(() => {
    let active = true;
    setLoading(true);
    setItems([]);
    setPage(1);
    setHasMore(true);
    (async () => {
      try {
        const { batch, totalPages } = await fetchPage(1);
        if (!active) return;
        setItems(batch);
        setHasMore(1 < totalPages);
        // categories from first pages
        const catMap = new Map();
        const colorMap = new Map();
        batch.forEach(p => {
          const key = p.category || 'General';
          if (!catMap.has(key)) catMap.set(key, { name: key, count: 0 });
          catMap.get(key).count += 1;
          
          // Collect colors
          if (p.color && p.color.trim()) {
            const colorKey = p.color.trim();
            if (!colorMap.has(colorKey)) colorMap.set(colorKey, { name: colorKey, count: 0 });
            colorMap.get(colorKey).count += 1;
          }
        });
        setCats(Array.from(catMap.values()).sort((a,b)=>b.count-a.count));
        setColors(Array.from(colorMap.values()).sort((a,b)=>b.count-a.count));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [q, category, minPrice, maxPrice, color, fetchPage]);

  // Infinite scroll
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(async (entries) => {
      const e = entries[0];
      if (e.isIntersecting && !loadingMore && hasMore) {
        setLoadingMore(true);
        const next = page + 1;
        try {
          const { batch, totalPages } = await fetchPage(next);
          setItems((prev) => [...prev, ...batch]);
          setPage(next);
          setHasMore(next < totalPages);
        } finally {
          setLoadingMore(false);
        }
      }
    }, { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [page, hasMore, loadingMore, fetchPage]);

  // Client-side sort (for price)
  const sorted = useMemo(() => {
    if (sort === 'price-asc') return [...items].sort((a,b)=>Number(a.price)-Number(b.price));
    if (sort === 'price-desc') return [...items].sort((a,b)=>Number(b.price)-Number(a.price));
    return items; // 'new' relies on API default sorting
  }, [items, sort]);

  const clearFilters = () => {
    setQ(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setColor(''); setSort('new');
    navigate('/shop', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Sidebar Filters */}
          <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                position: { md: 'sticky' }, 
                top: { md: 80 },
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                <FilterList fontSize="small" color="action" />
                <Typography variant="caption" fontWeight={600}>
                  Filters
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 1.5 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Search */}
                <TextField
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Category */}
                <Box>
                  <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mb: 0.75, display: 'block', fontSize: '0.7rem' }}>
                    Category
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">All</MenuItem>
                      {cats.map(c => (
                        <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Price Range */}
                <Box>
                  <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mb: 0.75, display: 'block', fontSize: '0.7rem' }}>
                    Price
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                    <TextField
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      type="number"
                      size="small"
                      inputProps={{ min: '0', step: '0.01' }}
                    />
                    <TextField
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      type="number"
                      size="small"
                      inputProps={{ min: '0', step: '0.01' }}
                    />
                  </Box>
                </Box>

                {/* Color */}
                <Box>
                  <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mb: 0.75, display: 'block', fontSize: '0.7rem' }}>
                    Color
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Box
                      onClick={() => setColor('')}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: 2,
                        borderColor: color === '' ? 'primary.main' : 'divider',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: 'white',
                        transition: 'all 0.2s',
                        boxShadow: color === '' ? 2 : 0,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2
                        }
                      }}
                      title="All Colors"
                    >
                      All
                    </Box>
                    {colors.map(c => {
                      const colorValue = getColorValue(c.name);
                      const isGradient = colorValue.startsWith('linear-gradient');
                      return (
                        <Box
                          key={c.name}
                          onClick={() => setColor(c.name)}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: 2,
                            borderColor: color === c.name ? 'primary.main' : 'divider',
                            background: colorValue,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: color === c.name ? 2 : 0,
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: 2
                            }
                          }}
                          title={c.name}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Sort */}
                <Box>
                  <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mb: 0.75, display: 'block', fontSize: '0.7rem' }}>
                    Sort
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <MenuItem value="new">Newest</MenuItem>
                      <MenuItem value="price-asc">Price: Low to High</MenuItem>
                      <MenuItem value="price-desc">Price: High to Low</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Button 
                    onClick={() => syncUrl({})} 
                    variant="contained" 
                    fullWidth
                    size="small"
                  >
                    Apply
                  </Button>
                  <Button 
                    onClick={clearFilters} 
                    variant="text" 
                    fullWidth
                    size="small"
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Products Grid */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Products
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {loading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                sorted.map(p => (
                  <Grid item xs={12} sm={6} md={3} key={p._id}>
                    <ProductCard p={p} />
                  </Grid>
                ))
              )}
            </Grid>

            {/* Sentinel & status */}
            <div ref={sentinelRef} style={{ height: 48 }} />
            
            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Loading more…
                </Typography>
              </Box>
            )}
            
            {!loading && !sorted.length && (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No products match your filters.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
