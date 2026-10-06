import { useState } from 'react';
import { IconButton, ListItemIcon, Menu, MenuItem, Divider } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreHoriz';
import DetailsIcon from '@mui/icons-material/OpenInNew';
import { usePeerActions } from './usePeerActions';
import { v } from '../../theme';

/** "⋯" menu of a table row: the peer's actions with labels, plus "Details". */
export default function RowActions({ address, onDetails }: { address: string; onDetails?: () => void }) {
  const [anchorEl, set_anchorEl] = useState<null | HTMLElement>(null);
  // dialogs are only mounted once the menu was used, long tables stay light
  const [used, set_used] = useState(false);
  const { actions, dialogs } = usePeerActions(address);
  const regular = actions.filter((action) => !action.danger);
  const danger = actions.filter((action) => action.danger);

  return (
    <span onClick={(event) => event.stopPropagation()}>
      <IconButton
        size="small"
        aria-label="Actions"
        onClick={(event) => {
          set_used(true);
          set_anchorEl(event.currentTarget);
        }}
      >
        <MoreIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => set_anchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: -4, horizontal: 'right' }}
        disableScrollLock
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        {onDetails && (
          <MenuItem
            onClick={() => {
              set_anchorEl(null);
              onDetails();
            }}
          >
            <ListItemIcon>
              <DetailsIcon fontSize="small" />
            </ListItemIcon>
            Details
          </MenuItem>
        )}
        {onDetails && regular.length > 0 && <Divider />}
        {regular.map((action) => (
          <MenuItem
            key={action.key}
            onClick={() => {
              set_anchorEl(null);
              action.run();
            }}
          >
            <ListItemIcon>{action.icon}</ListItemIcon>
            {action.label}
          </MenuItem>
        ))}
        {danger.length > 0 && <Divider />}
        {danger.map((action) => (
          <MenuItem
            key={action.key}
            sx={{ color: v.danger, '& .MuiListItemIcon-root': { color: v.danger } }}
            onClick={() => {
              set_anchorEl(null);
              action.run();
            }}
          >
            <ListItemIcon>{action.icon}</ListItemIcon>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
      {used && dialogs}
    </span>
  );
}
