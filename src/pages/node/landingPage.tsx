import styled from '@emotion/styled';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { authActions } from '../../store/slices/auth';
import Button from '../../future-hopr-lib-components/Button';
import Section from '../../future-hopr-lib-components/Section';
import { layout, v } from '../../theme';

import RouterIcon from '@mui/icons-material/RouterOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NorthEastIcon from '@mui/icons-material/NorthEast';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: calc(100vh - ${layout.navBarHeight}px - 140px);
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 520px;
`;

const Mark = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid ${v.border};
  background: ${v.surface};
  color: ${v.accentText};
  margin-bottom: 28px;
  svg {
    width: 22px;
    height: 22px;
  }
`;

const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: ${v.text};
`;

const Description = styled.p`
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.6;
  color: ${v.text2};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .MuiButton-root {
    min-height: 36px;
    padding: 6px 14px;
    gap: 6px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const Hint = styled.p`
  margin: 16px 0 0;
  font-size: 12.5px;
  color: ${v.text3};
  code {
    color: ${v.text2};
  }
`;

const Links = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid ${v.border};
  width: 100%;
  a {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 13px;
    color: ${v.text2};
    transition: color 120ms ease;
    &:hover {
      color: ${v.text};
    }
    svg {
      width: 13px;
      height: 13px;
      color: ${v.text3};
    }
  }
`;

const links = [
  { name: 'Documentation', href: 'https://docs.hoprnet.org' },
  { name: 'Staking Hub', href: 'https://hub.hoprnet.org' },
  { name: 'Telegram', href: 'https://t.me/hoprnet' },
];

function LandingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const searchParams = useLocation().search;
  const nodeConnected = useAppSelector((store) => store.auth.status.connected);

  return (
    <Section
      className="Section--landing"
      id="Section--landing"
      fullHeightMin
    >
      <Wrapper>
        <Hero>
          <Mark>
            <RouterIcon />
          </Mark>
          <Title>Node Admin</Title>
          <Description>
            Monitor and operate your HOPR node: connectivity, balances, channels, peers, sessions and tickets in one
            place.
          </Description>
          <Actions>
            {nodeConnected ? (
              <Button onClick={() => navigate(`/node/info${searchParams ?? ''}`)}>
                Open overview
                <ArrowForwardIcon />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  dispatch(authActions.setOpenLoginModalToNode(true));
                  setTimeout(() => {
                    dispatch(authActions.setOpenLoginModalToNode(false)), 300;
                  });
                }}
              >
                Connect node
              </Button>
            )}
          </Actions>
          {!nodeConnected && (
            <Hint>
              You need the node&apos;s API endpoint and token. They can also be passed in the URL as{' '}
              <code>?apiEndpoint=…&amp;apiToken=…</code>
            </Hint>
          )}
          <Links>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
                <NorthEastIcon />
              </a>
            ))}
          </Links>
        </Hero>
      </Wrapper>
    </Section>
  );
}

export default LandingPage;
