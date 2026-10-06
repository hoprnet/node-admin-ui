import { useState } from 'react';
import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import ContrastIcon from '@mui/icons-material/Contrast';
import CheckIcon from '@mui/icons-material/Check';
import { ColorModePreference, useColorMode } from '../../theme';

const options: { value: ColorModePreference; label: string; icon: JSX.Element }[] = [
  { value: 'system', label: 'System', icon: <ContrastIcon fontSize="small" /> },
  { value: 'light', label: 'Light', icon: <LightModeOutlinedIcon fontSize="small" /> },
  { value: 'dark', label: 'Dark', icon: <DarkModeOutlinedIcon fontSize="small" /> },
];

export default function ColorModeToggle() {
  const { preference, mode, setPreference } = useColorMode();
  const [anchorEl, set_anchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Tooltip title="Theme">
        <IconButton
          aria-label="Change theme"
          onClick={(event) => set_anchorEl(event.currentTarget)}
        >
          {mode === 'dark' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => set_anchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: -6, horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 160 } } }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={preference === option.value}
            onClick={() => {
              setPreference(option.value);
              set_anchorEl(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: '28px !important', color: 'inherit' }}>{option.icon}</ListItemIcon>
            <span style={{ flexGrow: 1 }}>{option.label}</span>
            {preference === option.value && <CheckIcon sx={{ fontSize: 16 }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
