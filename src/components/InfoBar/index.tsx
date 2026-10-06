import { useAppSelector } from '../../store';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { layout, v } from '../../theme';
import { infoBarBreakpoint } from '../../future-hopr-lib-components/Layout';

// HOPR Components
import Details from './details';
import FAQ from '../Faq';
import nodeInfoData from '../Faq/node-faq';
import stakingAlertsData from '../Faq/staking-alerts';

type InfoData = {
  [routePath: string]: {
    id: number;
    title: string;
    content: string;
  }[];
};

interface Props {}

const SInfoBar = styled.aside`
  display: none;
  width: ${layout.infoBarWidth}px;
  position: fixed;
  top: ${layout.navBarHeight}px;
  right: 0;
  height: calc(100vh - ${layout.navBarHeight}px);
  box-sizing: border-box;
  border-left: 1px solid ${v.border};
  background: ${v.bg};
  @media (min-width: ${infoBarBreakpoint}px) {
    display: block;
  }
`;

const Scroll = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  & > div {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 28px 16px 40px;
  }
`;

export default function InfoBar(props: Props) {
  const nodeConnected = useAppSelector((store) => store.auth.status.connected);
  const currentRoute = useLocation().pathname;
  const currentHash = window.location.hash;

  const pageHasNodeFAQ = () => {
    if (nodeInfoData[currentRoute]) return true;
    return false;
  };

  return (
    <SInfoBar className={`InfoBar ${nodeConnected ? 'node' : ''}`}>
      <Scroll>
        <div>
          {nodeConnected && <Details />}
          {nodeConnected && pageHasNodeFAQ() && (
            <FAQ
              data={nodeInfoData[currentRoute]}
              label={currentRoute.split('/')[currentRoute.split('/').length - 1]}
              variant="blue"
            />
          )}
        </div>
      </Scroll>
    </SInfoBar>
  );
}
