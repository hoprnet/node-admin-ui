import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Drawer as MuiDrawer,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { ApplicationMapType } from '../../applicationMap';
import Details from '../../components/InfoBar/details';
import { rounder2 } from '../../utils/functions';
import RefreshIcon from '@mui/icons-material/Refresh';
import packageJson from '../../../package.json';
import { layout, v } from '../../theme';

export const drawerWidth = layout.drawerWidth;
export const minDrawerWidth = layout.minDrawerWidth;

const StyledDrawer = styled(MuiDrawer)`
  .MuiDrawer-paper {
    box-sizing: border-box;
    padding-top: ${layout.navBarHeight}px;
    transition: width 0.2s ease;
    overflow-x: hidden;
    scrollbar-width: none;
    display: flex;
    flex-direction: column;
    &::-webkit-scrollbar {
      display: none;
    }
    width: ${(props) => (props.open ? `${drawerWidth}px` : `${minDrawerWidth}px`)};

    ${(props) =>
      props.variant === 'temporary' &&
      css`
        width: ${drawerWidth}px;
      `}
  }
`;

const Group = styled.div`
  padding: 12px 8px 4px;
  & + & {
    padding-top: 8px;
  }
  .MuiList-root {
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
`;

const StyledListSubheader = styled(ListSubheader)`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.02em;
  color: ${v.text3};
  background: transparent;
  user-select: none;
  white-space: nowrap;
  position: static;
  &.collapsed {
    padding: 0;
    justify-content: center;
    &::after {
      content: '';
      width: 16px;
      height: 1px;
      background: ${v.borderStrong};
    }
  }
`;

const StyledListItemButton = styled(ListItemButton)`
  height: 34px;
  border-radius: 6px;
  padding: 0 8px 0 10px;
  color: ${v.text2};
  transition: background-color 100ms ease, color 100ms ease;
  .MuiListItemIcon-root {
    min-width: 30px;
    color: ${v.text3};
    svg {
      width: 18px;
      height: 18px;
    }
  }
  .MuiTypography-root {
    font-size: 13.5px;
    font-weight: 450;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &:hover {
    background-color: ${v.surface2};
    color: ${v.text};
    .MuiListItemIcon-root {
      color: ${v.text2};
    }
  }
  &.Mui-selected,
  &.Mui-selected:hover {
    background-color: ${v.accentSoft};
    color: ${v.accentText};
    .MuiTypography-root {
      font-weight: 550;
    }
    .MuiListItemIcon-root {
      color: ${v.accentText};
    }
  }
  &.Mui-disabled {
    opacity: 0.45;
  }
  &.Mui-focusVisible {
    box-shadow: 0 0 0 2px ${v.focus};
  }
` as typeof ListItemButton;

const SListItemIcon = styled(ListItemIcon)``;

const Numbers = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${v.text3};
  min-width: 20px;
  text-align: right;
  .Mui-selected & {
    color: ${v.accentText};
  }
`;

const NumbersLoading = styled.div`
  display: flex;
  color: ${v.text3};
  svg {
    animation: rotation 1.2s infinite linear;
    height: 14px !important;
    width: 14px !important;
  }
`;

const Footer = styled.div`
  margin-top: auto;
  padding: 12px 18px 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: ${v.text3};
  white-space: nowrap;
  overflow: hidden;
`;

type DrawerProps = {
  drawerItems: ApplicationMapType;
  drawerFunctionItems?: ApplicationMapType;
  drawerLoginState?: {
    node?: boolean;
    web3?: boolean;
    safe?: boolean;
  };
  drawerNumbers?: {
    [key: string]: number | string | undefined | null;
  };
  drawerNumbersLoading?: {
    [key: string]: boolean;
  };
  openedNavigationDrawer: boolean;
  drawerType?: 'blue' | 'white' | false;
  set_openedNavigationDrawer: (openedNavigationDrawer: boolean) => void;
};

const Drawer = ({
  drawerItems,
  drawerLoginState,
  openedNavigationDrawer,
  set_openedNavigationDrawer,
  drawerType,
  drawerFunctionItems,
  drawerNumbers,
  drawerNumbersLoading,
}: DrawerProps) => {
  const location = useLocation();
  const searchParams = location.search;
  const isMobile = !useMediaQuery('(min-width: 500px)');
  const [drawerVariant, set_drawerVariant] = useState<'permanent' | 'temporary'>('permanent');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) {
        set_drawerVariant('temporary');
      } else {
        set_drawerVariant('permanent');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleButtonClick = () => {
    if (drawerVariant === 'temporary') {
      set_openedNavigationDrawer(false);
    }
  };

  const preare = drawerFunctionItems ? drawerFunctionItems : [];
  const allItems = [...preare, ...drawerItems];

  return (
    <StyledDrawer
      variant={drawerVariant}
      open={openedNavigationDrawer}
      onClose={() => set_openedNavigationDrawer(false)}
    >
      {allItems.map(
        (group) =>
          ((group.mobileOnly === true && isMobile) || !group.mobileOnly) && (
            <Group key={group.groupName}>
              <List
                subheader={
                  openedNavigationDrawer ? (
                    <StyledListSubheader className="StyledListSubheader">{group.groupName}</StyledListSubheader>
                  ) : (
                    <StyledListSubheader className="StyledListSubheader collapsed" />
                  )
                }
              >
                {group.items.map(
                  (item) =>
                    item.inDrawer !== false &&
                    ((item.mobileOnly === true && isMobile) || !item.mobileOnly) && (
                      <Tooltip
                        key={item.name}
                        title={!openedNavigationDrawer ? item.name : ''}
                        placement="right"
                      >
                        <StyledListItemButton
                          component={item.onClick ? 'button' : Link}
                          to={
                            item.path !== 'function'
                              ? item.path.includes('http')
                                ? item.path
                                : item.overwritePath
                                ? item.overwritePath
                                : `${group.path}/${item.path}${searchParams ?? ''}`
                              : undefined
                          }
                          target={item.path.includes('http') ? '_blank' : undefined}
                          rel={item.path.includes('http') ? 'noopener noreferrer' : undefined}
                          selected={location.pathname === `/${group.path}/${item.path}`}
                          disabled={
                            item.path.includes('http')
                              ? false
                              : (!item.element && !item.onClick) ||
                                (item.loginNeeded && !drawerLoginState?.[item.loginNeeded])
                          }
                          onClick={item.onClick ? item.onClick : handleButtonClick}
                          className="StyledListItemButton"
                        >
                          <SListItemIcon className="SListItemIcon">{item.icon}</SListItemIcon>
                          <ListItemText className="ListItemText">{item.name}</ListItemText>
                          {item.numberKey &&
                            item.fetchingKey &&
                            drawerNumbers &&
                            drawerNumbersLoading &&
                            openedNavigationDrawer &&
                            item.loginNeeded &&
                            drawerLoginState?.[item.loginNeeded] &&
                            typeof drawerNumbers[item.numberKey] !== 'number' &&
                            drawerNumbersLoading[item.fetchingKey] && (
                              <NumbersLoading>
                                <RefreshIcon />
                              </NumbersLoading>
                            )}
                          {item.numberKey &&
                            drawerNumbers &&
                            openedNavigationDrawer &&
                            item.loginNeeded &&
                            drawerLoginState?.[item.loginNeeded] &&
                            typeof drawerNumbers[item.numberKey] === 'number' && (
                              <Numbers>{rounder2(drawerNumbers[item.numberKey])}</Numbers>
                            )}
                        </StyledListItemButton>
                      </Tooltip>
                    ),
                )}
              </List>
            </Group>
          ),
      )}
      {drawerVariant === 'temporary' && <Details style={{ margin: '16px 8px 0' }} />}
      <Footer>{openedNavigationDrawer ? `UI v${packageJson.version}` : `v${packageJson.version.split('.')[0]}`}</Footer>
    </StyledDrawer>
  );
};

export default Drawer;
