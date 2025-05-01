// src/theme.js
import { extendTheme } from '@chakra-ui/react';

// === TOGGLE background style here ===
const backgroundStyle = 'dots'; // Options: 'topographic', 'grid', 'dots', 'none'

// === Define background patterns ===
const backgroundPresets = {
  topographic: {
    backgroundImage: `
      radial-gradient(circle at 50% 50%, 
      rgba(0, 0, 0, 0.01) 0%, 
      rgba(0, 0, 0, 0) 50%, 
      rgba(0, 0, 0, 0.01) 100%)`,
    backgroundSize: '80px 80px',
  },
  grid: {
    backgroundImage: `
      linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '-1px -1px',
  },
  dots: {
    backgroundImage: `
      radial-gradient(circle, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
    backgroundSize: '15px 15px',
  },
  none: {
    backgroundImage: 'none',
  },
};

const selectedBackground = backgroundPresets[backgroundStyle];

const theme = extendTheme({
  fonts: {
    heading: `'Cal Sans', 'Lato', -apple-system, sans-serif`,
    body: `'Lato', -apple-system, sans-serif`,
    mono: `'JetBrains Mono', monospace`,
  },
  colors: {
    brand: {
      mint: '#A8E6CF',
      peach: '#FFD3B6',
      charcoal: '#264653',
      cream: '#F8F4E3',
      navy: '#0A2342',
      copper: '#C17817',
      sage: '#8AAA79',
      rust: '#BF4342',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: 'medium',
        _focus: { boxShadow: 'outline' },
      },
      variants: {
        solid: {
          bg: 'brand.mint',
          color: 'brand.charcoal',
          _hover: {
            bg: 'brand.sage',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          transition: 'all 0.2s',
        },
        outline: {
          borderColor: 'brand.mint',
          color: 'brand.charcoal',
          _hover: {
            bg: 'brand.mint',
            color: 'brand.navy',
          },
        },
        ghost: {
          color: 'brand.charcoal',
          _hover: {
            bg: 'rgba(168, 230, 207, 0.2)',
          },
        },
      },
    },
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            _selected: {
              color: 'brand.charcoal',
              bg: 'brand.mint',
            },
            _hover: {
              bg: 'brand.cream',
            },
            fontWeight: 'medium',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'full',
        },
      },
      variants: {
        outline: {
          field: {
            _focus: {
              borderColor: 'brand.mint',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-mint)',
            },
            _hover: {
              borderColor: 'brand.mint',
            },
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          boxShadow: 'sm',
          borderRadius: 'lg',
          overflow: 'hidden',
          backgroundColor: 'white',
          border: '1px solid',
          borderColor: 'brand.cream',
        },
        header: {
          paddingY: 3,
          paddingX: 4,
        },
        body: {
          paddingY: 3,
          paddingX: 4,
        },
        footer: {
          paddingY: 3,
          paddingX: 4,
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.cream',
        color: 'brand.charcoal',
        ...selectedBackground,
      },
      '*:focus': {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(168, 230, 207, 0.6) !important',
      },
      'input, select, textarea, button': {
        transition: 'all 0.2s ease-in-out',
      },
    },
  },
});

export default theme;
