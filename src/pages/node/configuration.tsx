import { useEffect, useState, KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { formatEther } from 'viem';
import { rounder, rounder2 } from '../../utils/functions';
import { exportToFile } from '../../utils/helpers';
import yaml from 'js-yaml';

// HOPR Components
import { SubpageTitle } from '../../components/SubpageTitle';
import { CardStack, TableExtended } from '../../future-hopr-lib-components/Table/columed-data';
import Section from '../../future-hopr-lib-components/Section';
import Button from '../../future-hopr-lib-components/Button';
import CodeCopyBox from '../../components/Code/CodeCopyBox';
import IconButton from '../../future-hopr-lib-components/Button/IconButton';
import TextField from '../../future-hopr-lib-components/TextField';

// Mui
import { Switch } from '@mui/material';
import styled from '@emotion/styled';
import { appActions } from '../../store/slices/app';
import { blokliActions } from '../../store/slices/blokli';
import { selectBlokliUrl } from '../../store/selectors/blokli';
import { parseAndFormatUrl } from '../../utils/parseAndFormatUrl';
import GetAppIcon from '@mui/icons-material/GetApp';

const NotificationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SettingRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 460px;
  cursor: pointer;
  .MuiSwitch-root {
    margin-right: 0;
  }
`;

const BlokliContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
`;

const BlokliButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const DECIMALS_MULTIPLIER = BigInt(1e18); // For HOPR token's 18 decimals

interface StrategyConfig {
  path: ['AutoFunding' | 'AutoRedeeming', string];
  value: string;
}

const calculateTickets = (value: string, ticketPrice: string) => {
  console.log({ value, ticketPrice });
  const valueBigInt = BigInt(value);
  const ticketBigInt = BigInt(ticketPrice);
  return valueBigInt / ticketBigInt;
};

const updateStrategyString = (originalString: string, key: string, value: string, tickets: bigint): string => {
  const stringToReplace = `"${key}": "${value} HOPR"`;
  const formattedEther = formatEther(BigInt(value));
  const replacement = `"${key}": "${value}" // = ${formattedEther} wxHOPR (${rounder(Number(tickets))} tickets)`;

  return originalString.includes(stringToReplace + ',')
    ? originalString.replace(stringToReplace + ',', replacement + ',')
    : originalString.replace(stringToReplace, replacement);
};

function SettingsPage() {
  const dispatch = useAppDispatch();
  const prevNotificationSettings = useAppSelector((store) => store.app.configuration.notifications);
  const aliasMergeMode = useAppSelector((store) => store.app.configuration.aliases.mergeMode);
  const blokliUrlOverride = useAppSelector((store) => store.blokli.url);
  const effectiveBlokliUrl = useAppSelector(selectBlokliUrl) ?? '';
  const strategy = useAppSelector((store) => store.node.configuration.data?.strategy);
  const configuration = useAppSelector((store) => store.node.configuration.data);
  const ticketPrice = useAppSelector((store) => store.node.ticketPrice.data);
  const mypeerAddress = useAppSelector((store) => store.node.addresses.data.native);
  const [strategiesString, set_strategiesString] = useState<string | null>(null);
  const [configurationString, set_configurationString] = useState<string | null>(null);
  const [localNotificationSettings, set_localNotificationSettings] = useState<typeof prevNotificationSettings>();
  const [localBlokliUrl, set_localBlokliUrl] = useState('');
  const [blokliUrlError, set_blokliUrlError] = useState<string | null>(null);
  const canSaveBlokliUrl = localBlokliUrl !== effectiveBlokliUrl;
  const canSave = !(
    localNotificationSettings?.channels === prevNotificationSettings.channels &&
    localNotificationSettings?.message === prevNotificationSettings.message &&
    localNotificationSettings?.nodeBalances === prevNotificationSettings.nodeBalances &&
    localNotificationSettings?.nodeInfo === prevNotificationSettings.nodeInfo &&
    localNotificationSettings?.pendingSafeTransaction === prevNotificationSettings.pendingSafeTransaction
  );

  useEffect(() => {
    window.addEventListener('keydown', handleEnter as unknown as EventListener);
    return () => {
      window.removeEventListener('keydown', handleEnter as unknown as EventListener);
    };
  }, [localNotificationSettings]);

  useEffect(() => {
    if (prevNotificationSettings) {
      set_localNotificationSettings(prevNotificationSettings);
    }
  }, [prevNotificationSettings]);

  useEffect(() => {
    set_localBlokliUrl(effectiveBlokliUrl);
    set_blokliUrlError(null);
  }, [effectiveBlokliUrl]);

  // Usage in useEffect
  useEffect(() => {
    if (!strategy || !ticketPrice) return;

    const strategyTMP = { strategy: JSON.parse(JSON.stringify(strategy)) };
    delete strategyTMP.strategy['parsedStrategies'];

    try {
      const configs: StrategyConfig[] = [
        {
          path: ['AutoFunding', 'min_stake_threshold'],
          value: strategy.strategies?.AutoFunding?.min_stake_threshold?.replace(' wxHOPR', ''),
        },
        {
          path: ['AutoFunding', 'funding_amount'],
          value: strategy.strategies?.AutoFunding?.funding_amount?.replace(' wxHOPR', ''),
        },
        {
          path: ['AutoRedeeming', 'minimum_redeem_ticket_value'],
          value: strategy.strategies?.AutoRedeeming?.minimum_redeem_ticket_value?.replace(' wxHOPR', ''),
        },
        {
          path: ['AutoRedeeming', 'on_close_redeem_single_tickets_value_min'],
          value: strategy.strategies?.AutoRedeeming?.on_close_redeem_single_tickets_value_min?.replace(' wxHOPR', ''),
        },
      ];

      let strategiesString = yaml.dump(strategyTMP);

      // * Add ! in front of the strategy name to make yaml copy-paste friendly
      const strategiesSet = [];
      if (strategyTMP.strategy.strategies) {
        for (let i = 0; i < strategyTMP.strategy.strategies.length; i++) {
          const strategyName = Object.keys(strategyTMP.strategy.strategies[i])[0];
          strategiesSet.push(strategyName);
          try {
            const strategyDetails = strategyTMP.strategy.strategies[i][strategyName];
            const strategyDetailsKeys = Object.keys(strategyDetails);
            for (const key of strategyDetailsKeys) {
              const strategyValue = strategyDetails[key];
              if (typeof strategyValue !== 'string') continue;
              if (
                strategyValue.includes(' wxHOPR') ||
                strategyValue.includes('>') ||
                strategyValue.includes('<') ||
                strategyValue.includes('=')
              ) {
                strategiesString = strategiesString.replace(`${key}: ${strategyValue}`, `${key}: "${strategyValue}"`);
              }
            }
          } catch (e) {
            console.warn(`Error while processing strategy details for ${strategyName}`, e);
          }
        }
      }
      strategiesSet.forEach((strategyName) => {
        strategiesString = strategiesString.replace(`- ${strategyName}:`, `- !${strategyName}`);
      });
      // **********************************************************************

      set_strategiesString(strategiesString);
    } catch (e) {
      console.warn('Error while counting strategies against current ticket price.', e);
    }
  }, [strategy, ticketPrice]);

  useEffect(() => {
    if (configuration) {
      let tmp = JSON.parse(JSON.stringify(configuration));
      tmp['strategy'] && delete tmp['strategy'];
      tmp = yaml.dump(tmp);
      set_configurationString(tmp);
    }
  }, [configuration]);

  function handleSaveSettings() {
    if (localNotificationSettings) {
      dispatch(appActions.setNotificationSettings(localNotificationSettings));
    }
  }

  function handleSaveBlokliUrl() {
    const formattedUrl = parseAndFormatUrl(localBlokliUrl);
    if (!formattedUrl) {
      set_blokliUrlError('Blokli URL was incorrectly formatted');
      return;
    }
    set_blokliUrlError(null);
    dispatch(
      blokliActions.setUrl({
        nodeAddress: mypeerAddress,
        url: formattedUrl,
      }),
    );
  }

  function handleResetBlokliUrl() {
    set_blokliUrlError(null);
    dispatch(blokliActions.resetUrl(mypeerAddress));
  }

  // the 2 merge options are exclusive, turning the active one off means no merging at all
  function handleAliasMergeToggle(mode: 'network' | 'all') {
    dispatch(appActions.setAliasSettings({ mergeMode: aliasMergeMode === mode ? 'none' : mode }));
  }

  function handleEnter(event: KeyboardEvent) {
    if (canSave && event.key === 'Enter') {
      handleSaveSettings();
    }
  }

  const handleExport = () => {
    if (strategiesString) {
      exportToFile(strategiesString, `strategy-${mypeerAddress}.yaml`, 'text/yaml');
    }
  };

  return (
    <Section
      className="Section--settings"
      id="Section--settings"
      fullHeightMin
      yellow
    >
      <SubpageTitle title="Configuration" />
      <CardStack>
        <TableExtended title="Node">
          <tbody>
            <tr>
              <th>Blokli URL</th>
              <td>
                <BlokliContainer>
                  <TextField
                    value={localBlokliUrl}
                    placeholder="https://blokli.example/"
                    onChange={(event) => {
                      set_localBlokliUrl(event.target.value);
                    }}
                    error={!!blokliUrlError}
                    helperText={
                      blokliUrlError ?? (blokliUrlOverride ? undefined : `Using the URL reported by the node`)
                    }
                  />
                  <BlokliButtons>
                    <Button
                      outlined
                      onClick={handleResetBlokliUrl}
                      disabled={!blokliUrlOverride}
                    >
                      Reset to node&apos;s
                    </Button>
                    <Button
                      onClick={handleSaveBlokliUrl}
                      disabled={!canSaveBlokliUrl}
                    >
                      Save
                    </Button>
                  </BlokliButtons>
                </BlokliContainer>
              </td>
            </tr>

            <tr>
              <th>Notifications</th>
              <td>
                <NotificationsContainer>
                  <SettingRow>
                    <span>Channels</span>
                    <Switch
                      checked={localNotificationSettings?.channels}
                      onChange={() => {
                        console.log('localNotificationSettings', localNotificationSettings);
                        if (localNotificationSettings) {
                          set_localNotificationSettings({
                            ...localNotificationSettings,
                            channels: !localNotificationSettings.channels,
                          });
                        }
                      }}
                      color="primary"
                    />
                  </SettingRow>
                  {/* <SettingRow>
                    <span>Message</span>
                    <Switch
                      checked={localNotificationSettings?.message}
                      onChange={() => {
                        if (localNotificationSettings) {
                          set_localNotificationSettings({
                            ...localNotificationSettings,
                            message: !localNotificationSettings.message,
                          });
                        }
                      }}
                      color="primary"
                    />
                  </SettingRow> */}
                  <SettingRow>
                    <span>Node Balance</span>
                    <Switch
                      checked={localNotificationSettings?.nodeBalances}
                      onChange={() => {
                        if (localNotificationSettings) {
                          set_localNotificationSettings({
                            ...localNotificationSettings,
                            nodeBalances: !localNotificationSettings.nodeBalances,
                          });
                        }
                      }}
                      color="primary"
                    />
                  </SettingRow>
                  <SettingRow>
                    <span>Node Info</span>
                    <Switch
                      checked={localNotificationSettings?.nodeInfo}
                      onChange={() => {
                        if (localNotificationSettings) {
                          set_localNotificationSettings({
                            ...localNotificationSettings,
                            nodeInfo: !localNotificationSettings.nodeInfo,
                          });
                        }
                      }}
                      color="primary"
                    />
                  </SettingRow>
                </NotificationsContainer>
                <Button
                  style={{
                    marginTop: '1rem',
                    float: 'right',
                  }}
                  onClick={handleSaveSettings}
                  disabled={!canSave}
                >
                  Save
                </Button>
              </td>
            </tr>

            <tr>
              <th>Aliases</th>
              <td>
                <NotificationsContainer>
                  <SettingRow>
                    <span>Merge aliases between nodes on the same network</span>
                    <Switch
                      checked={aliasMergeMode === 'network'}
                      onChange={() => {
                        handleAliasMergeToggle('network');
                      }}
                      color="primary"
                    />
                  </SettingRow>
                  <SettingRow>
                    <span>Merge aliases between all saved nodes</span>
                    <Switch
                      checked={aliasMergeMode === 'all'}
                      onChange={() => {
                        handleAliasMergeToggle('all');
                      }}
                      color="primary"
                    />
                  </SettingRow>
                </NotificationsContainer>
              </td>
            </tr>

            <tr>
              <th>
                Strategy
                <IconButton
                  iconComponent={<GetAppIcon />}
                  tooltipText={<span>Export Strategy</span>}
                  onClick={handleExport}
                />
              </th>
              <td>
                {strategiesString && (
                  <CodeCopyBox
                    code={strategiesString}
                    breakSpaces
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>Configuration</th>
              <td>
                {configurationString && (
                  <CodeCopyBox
                    code={configurationString}
                    breakSpaces
                  />
                )}
              </td>
            </tr>
          </tbody>
        </TableExtended>
      </CardStack>
    </Section>
  );
}

export default SettingsPage;
