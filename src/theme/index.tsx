import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, GlobalStyles, ThemeProvider, useMediaQuery } from '@mui/material';
import { ColorMode, fonts, radius, toCssVars, tokens, v } from './tokens';

export * from './tokens';

export type ColorModePreference = ColorMode | 'system';

const STORAGE_KEY = 'colorMode';

export const buildTheme = (mode: ColorMode) => {
  const t = tokens[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: t.accent, dark: t.accentHover, contrastText: t.accentContrast },
      secondary: { main: t.text2 },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.danger },
      info: { main: t.accent },
      background: { default: t.bg, paper: t.surface },
      text: { primary: t.text, secondary: t.text2, disabled: t.text3 },
      divider: t.border,
      action: {
        hover: t.surface2,
        selected: t.accentSoft,
        disabled: t.text3,
        disabledBackground: t.surface3,
      },
    },
    shape: { borderRadius: radius.md },
    typography: {
      fontFamily: fonts.sans,
      fontSize: 14,
      h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' },
      h2: { fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' },
      h3: { fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontSize: 16, fontWeight: 600 },
      h5: { fontSize: 14, fontWeight: 600 },
      h6: { fontSize: 13, fontWeight: 600 },
      body1: { fontSize: 14 },
      body2: { fontSize: 13 },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
    },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: t.border },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { border: `1px solid ${t.border}`, borderRadius: radius.lg } },
      },
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            minHeight: 32,
            padding: '5px 12px',
            borderRadius: radius.md,
            fontSize: 13.5,
            lineHeight: '20px',
            transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
            '&.Mui-focusVisible': { boxShadow: `0 0 0 3px ${t.focus}` },
          },
          containedPrimary: { '&:hover': { backgroundColor: t.accentHover } },
          outlined: {
            borderColor: t.borderStrong,
            color: t.text,
            backgroundColor: t.surface,
            '&:hover': { borderColor: t.borderStrong, backgroundColor: t.surface2 },
          },
          text: { color: t.text2, '&:hover': { backgroundColor: t.surface2, color: t.text } },
          sizeSmall: { minHeight: 28, padding: '3px 10px', fontSize: 13 },
          sizeLarge: { minHeight: 40, padding: '8px 16px', fontSize: 14.5 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            color: t.text2,
            transition: 'background-color 120ms ease, color 120ms ease',
            '&:hover': { backgroundColor: t.surface2, color: t.text },
            '&.Mui-focusVisible': { boxShadow: `0 0 0 3px ${t.focus}` },
          },
          sizeSmall: { padding: 4 },
          sizeMedium: { padding: 6 },
        },
      },
      MuiSvgIcon: { styleOverrides: { fontSizeMedium: { fontSize: 20 }, fontSizeSmall: { fontSize: 18 } } },
      MuiTooltip: {
        defaultProps: { arrow: false, enterDelay: 300 },
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? '#1d1d26' : t.surface3,
            color: mode === 'light' ? '#f3f3f6' : t.text,
            border: mode === 'light' ? 'none' : `1px solid ${t.borderStrong}`,
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.45,
            padding: '6px 8px',
            borderRadius: radius.sm + 1,
            maxWidth: 320,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${t.border}`, fontSize: 13, color: t.text, padding: '9px 16px' },
          head: {
            fontSize: 12,
            fontWeight: 500,
            color: t.text2,
            backgroundColor: t.surface,
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 80ms ease',
            'tbody &:hover': { backgroundColor: t.surface2 },
            '&:last-of-type td': { borderBottom: 'none' },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            border: `1px solid ${t.border}`,
            borderRadius: radius.xl,
            boxShadow: t.shadowOverlay,
            backgroundColor: t.surface,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            '&:not(.MuiBackdrop-invisible)': {
              backgroundColor: mode === 'light' ? 'rgba(23, 23, 31, 0.32)' : 'rgba(0, 0, 0, 0.6)',
            },
          },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontSize: 16, fontWeight: 600, padding: '20px 24px 8px' } } },
      MuiDialogContent: { styleOverrides: { root: { padding: '8px 24px' } } },
      MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 20px', gap: 8 } } },
      MuiPopover: {
        styleOverrides: {
          paper: { border: `1px solid ${t.border}`, borderRadius: radius.lg, boxShadow: t.shadowOverlay },
        },
      },
      MuiMenu: { styleOverrides: { list: { padding: 4 } } },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13.5,
            borderRadius: radius.sm,
            minHeight: 34,
            '&.Mui-selected': { backgroundColor: t.accentSoft, color: t.accentText },
            '&.Mui-selected:hover': { backgroundColor: t.accentSoft },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            backgroundColor: t.surface,
            fontSize: 14,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.borderStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.text3 },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: t.accent, borderWidth: 1 },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${t.focus}` },
          },
          input: { padding: '9px 12px' },
          inputSizeSmall: { padding: '6px 10px' },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: 14, color: t.text2 },
          outlined: {
            transform: 'translate(12px, 9px) scale(1)',
            '&.MuiInputLabel-shrink': { transform: 'translate(13px, -8px) scale(0.8)' },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          underline: {
            '&:before': { borderBottomColor: t.borderStrong },
            '&:hover:not(.Mui-disabled):before': { borderBottomColor: t.text3 },
          },
        },
      },
      MuiFormHelperText: { styleOverrides: { root: { fontSize: 12, marginLeft: 2, color: t.text3 } } },
      MuiSwitch: {
        styleOverrides: {
          root: { width: 34, height: 20, padding: 0, margin: '0 8px', overflow: 'visible' },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(14px)',
              color: '#fff',
              '& + .MuiSwitch-track': { backgroundColor: t.accent, opacity: 1 },
            },
            '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.4 },
            '&.Mui-focusVisible .MuiSwitch-thumb': { boxShadow: `0 0 0 3px ${t.focus}` },
          },
          thumb: { width: 16, height: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.25)', color: '#fff' },
          track: { borderRadius: 10, backgroundColor: t.borderStrong, opacity: 1 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { height: 22, borderRadius: radius.sm, fontSize: 12, fontWeight: 500 },
          label: { paddingLeft: 7, paddingRight: 7 },
        },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            borderBottom: `1px solid ${t.border}`,
            '&:before': { display: 'none' },
            '&:last-of-type': { borderBottom: 'none' },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: { padding: 0, minHeight: 40, fontSize: 13, fontWeight: 500, color: t.text },
          content: { margin: '10px 0' },
          expandIconWrapper: { color: t.text3 },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: { root: { padding: '0 0 12px', fontSize: 13, lineHeight: 1.55, color: t.text2 } },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: t.border } } },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundColor: t.surface, borderRight: `1px solid ${t.border}` } },
      },
      MuiAppBar: { defaultProps: { elevation: 0, color: 'inherit' } },
      MuiCircularProgress: { defaultProps: { thickness: 4 } },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 4, backgroundColor: t.surface3 } },
      },
      MuiCheckbox: { styleOverrides: { root: { color: t.borderStrong } } },
      MuiRadio: { styleOverrides: { root: { color: t.borderStrong } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: radius.md, fontSize: 13 } } },
    },
  });
};

const globalStyles = (mode: ColorMode) => ({
  ':root': { ...toCssVars(tokens[mode]), colorScheme: mode },
  body: {
    backgroundColor: v.bg,
    color: v.text,
  },
  '*::selection': { backgroundColor: v.focus },
  '*': { scrollbarColor: `${v.scrollbar} transparent`, scrollbarWidth: 'thin' as const },
});

type ColorModeContextValue = {
  preference: ColorModePreference;
  mode: ColorMode;
  setPreference: (preference: ColorModePreference) => void;
};

const ColorModeContext = createContext<ColorModeContextValue>({
  preference: 'system',
  mode: 'light',
  setPreference: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

const readPreference = (): ColorModePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch (e) {
    // storage unavailable: fall back to the OS preference
  }
  return 'system';
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [preference, setPreferenceState] = useState<ColorModePreference>(readPreference);
  const mode: ColorMode = preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference;

  const setPreference = (next: ColorModePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore, the preference simply won't persist
    }
  };

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const context = useMemo(() => ({ preference, mode, setPreference }), [preference, mode]);

  return (
    <ColorModeContext.Provider value={context}>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={globalStyles(mode)} />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
