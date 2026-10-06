import React from 'react';
import styled from '@emotion/styled';

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import NavBarItems from './navBarItems';
import { IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { layout, v } from '../../theme';
import ColorModeToggle from './colorModeToggle';

interface AppBarProps extends MuiAppBarProps {
  tallerNavBarOnMobile?: boolean;
  webapp?: boolean;
}

export const navBarHeight = layout.navBarHeight;

const AppBar = styled(({ tallerNavBarOnMobile, webapp, ...rest }: AppBarProps) => <MuiAppBar {...rest} />)`
  background: ${v.surface};
  color: ${v.text};
  height: ${navBarHeight}px;
  border-bottom: 1px solid ${v.border};
  box-shadow: none;
  z-index: 1201;
  ${(props) =>
    props.tallerNavBarOnMobile &&
    `
    @media screen and (max-width: 520px) {
      position: static;
    }
  `}
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 12px 0 10px;
  gap: 12px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  @media (max-width: 1100px) {
    justify-content: flex-end;
    flex-grow: 0;
    margin-left: auto;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex-shrink: 0;
  @media (max-width: 420px) {
    gap: 0;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 4px;
  user-select: none;
  img {
    height: 22px;
    width: auto;
    display: block;
    filter: brightness(0);
    opacity: 0.92;
  }
  html[data-theme='dark'] & img {
    filter: brightness(0) invert(1);
  }
  .divider {
    width: 1px;
    height: 16px;
    background: ${v.borderStrong};
  }
  .product {
    font-size: 13.5px;
    font-weight: 500;
    color: ${v.text2};
    white-space: nowrap;
  }
  @media (max-width: 420px) {
    .divider,
    .product {
      display: none;
    }
  }
`;

const NavBar: React.FC<{
  className?: string;
  webapp?: boolean;
  mainLogo?: string;
  mainLogoAlt?: string;
  tallerNavBarOnMobile?: boolean;
  itemsNavbarRight?: any;
  itemsNavbarCenter?: any;
  openedNavigationDrawer: boolean;
  set_openedNavigationDrawer: (openedNavigationDrawer: boolean) => void;
}> = ({
  webapp,
  mainLogo,
  mainLogoAlt,
  tallerNavBarOnMobile,
  itemsNavbarRight = [],
  itemsNavbarCenter,
  openedNavigationDrawer,
  set_openedNavigationDrawer,
}) => {
  return (
    <AppBar
      className="Hopr-navBar navbar"
      tallerNavBarOnMobile={tallerNavBarOnMobile}
      webapp={webapp}
    >
      <Container>
        <Left>
          <Tooltip title={openedNavigationDrawer ? 'Collapse sidebar' : 'Expand sidebar'}>
            <IconButton
              aria-label="Toggle navigation"
              onClick={() => set_openedNavigationDrawer(!openedNavigationDrawer)}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Brand className="logo-hopr">
            <img
              className="logo-hopr-navbar"
              alt={mainLogoAlt}
              src={mainLogo}
            />
            <span className="divider" />
            <span className="product">Node Admin</span>
          </Brand>
        </Left>
        {itemsNavbarCenter && <Center>{itemsNavbarCenter}</Center>}
        <Right>
          <ColorModeToggle />
          <NavBarItems
            itemsNavbar={itemsNavbarRight}
            right
            webapp={webapp}
          />
        </Right>
      </Container>
    </AppBar>
  );
};

export default NavBar;
