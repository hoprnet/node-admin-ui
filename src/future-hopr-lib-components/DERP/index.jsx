import React, { useState, useEffect, Fragment } from 'react';

import styled from '@emotion/styled';
import { chains } from '../../shared/chains.js';

const Location = styled.div`
  width: 100%;
  font-family: 'Source Code Pro';
  font-style: normal;
  font-size: 14px;

  th {
    font-size: 16px;
  }
  th,
  td {
    padding: 8px;
  }
  pre {
    max-width: 440px;
  }

  .hopr-table-header {
    background: linear-gradient(180deg, #0000b4 0.5%, #000050 100%);
    color: white;

    @media (min-width: 1040px) {
      .hopr-table-header-Location {
        width: 170px;
      }

      .hopr-table-header-IP {
        width: 160px;
      }

      .hopr-table-header-Status {
        width: 190px;
      }

      .hopr-table-header-MetaMask {
        //width: 76px;
      }

      .hopr-table-header-type {
        width: 76px;
      }

      .hopr-table-header-Timestamp {
        width: 157px;
      }

      .hopr-table-header-User-Agent {
        width: 208px;
      }

      .hopr-table-header-Method {
        width: 188px;
      }

      .hopr-table-header-Params {
      }
    }
  }

  .hopr-table-content-IP {
    overflow-wrap: anywhere;
  }
`;

function App() {
  const [log, setLog] = useState([]);
  const [ip, setIp] = useState('-');
  const [country, setCountry] = useState('-');
  const [status, setStatus] = useState('not connected');
  const [rpcUrl, setRpcUrl2] = useState('');
  const [chainId, setChainId] = useState('1');
  const [name, setName] = useState('DERP - ETH Mainnet');
  const [city, setCity] = useState(undefined);
  // const [coordinates, setCoordinates] = useState(undefined);

  //let currentWebSocket;

  const url = window.location.host;
  //const url = window.location.hostname + ':8788' //dev

  const updateIp = (ip, country) => {
    setIp(ip);
    setCountry(country);
  };

  const setConnectionStatus = () => {
    setStatus('connected');
  };

  const unsetConnectionStatus = () => {
    setStatus('not connected');
  };

  // const getIPInfo=()=>{
  //   fetch('https://ssl.geoplugin.net/json.gp?ip=79.184.238.42'
  //       ,{
  //         headers : {
  //           'Content-Type': 'application/json',
  //           'Accept': 'application/json'
  //         }
  //       }
  //   )
  //       .then(function(response){
  //         console.log(response)
  //         return response.json();
  //       })
  //       .then(function(myJson) {
  //         console.log(myJson);
  //       });
  // }
  // useEffect(()=>{
  //   getIPInfo()
  // },[])

  const setRpcUrl = () => {
    setRpcUrl2(`https://${url}/rpc/eth/mainnet`);
  };

  const updateInfo = (cf) => {
    setRpcUrl2(cf.originalUrl);
    setCity(cf.city);

    const chosenChain = chains.filter((chain) => cf.originalUrl.includes(chain.derpUrl))[0];
    if (chosenChain) {
      setChainId(chosenChain.chainId);
      setName('DERP - ' + chosenChain.name);
    }

    // if(cf.longitude && cf.latitude){
    //   setCoordinates()
    // }

    // cf: {
    //   "clientTcpRtt": 3,
    //     "longitude": "21.00260",
    //     "latitude": "52.24840",
    //     "tlsCipher": "AEAD-AES256-GCM-SHA384",
    //     "continent": "EU",
    //     "asn": 5617,
    //     "clientAcceptEncoding": "br, gzip, deflate",
    //     "country": "PL",
    //     "isEUCountry": "1",
    //     "colo": "WAW",
    //     "timezone": "Europe/Warsaw",
    //     "city": "Warsaw",
    //   "clientTrustScore": 1,
    //     "region": "Mazovia",
    //     "regionCode": "14",
    //     "asOrganization": "Orange Swiatlowod",
    //     "postalCode": "00-202",
    //     "originalUrl": "http://localhost:8788/rpc/xdai/mainnet"
    // }
  };

  const addLogEntry = (entry) => {
    setLog((prevState) => {
      const newState = [entry, ...prevState];
      console.log(newState);
      return newState;
    });
  };

  const join = () => {
    const wsUrl = `wss://${url}/client_logs/websocket`;
    const ws = new WebSocket(wsUrl);

    ws.addEventListener('open', (event) => {
      console.log('websocket opened');
      // currentWebSocket = ws;
      setConnectionStatus();
    });

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log('received websocket message', event.data);
      addLogEntry(data.log);
      updateIp(data.ip, data.country);
      updateInfo(data.cf);
    });

    ws.addEventListener('close', (event) => {
      console.log('websocket closed, reconnecting:', event.code, event.reason);
      unsetConnectionStatus();
      setTimeout(join(), 1000);
    });

    ws.addEventListener('error', (event) => {
      console.log('websocket error, reconnecting:', event);
      unsetConnectionStatus();
      //   setTimeout(join(), 1000);
    });
  };

  useEffect(() => {
    unsetConnectionStatus();
    setRpcUrl();
    join();
    //eslint-disable-next-line
  }, []);

  return (
    <Fragment>
      <Location>
        <table>
          <thead>
            <tr className={'hopr-table-header'}>
              <th className={'hopr-table-header-Location'}>Location</th>
              <th className={'hopr-table-header-IP'}>IP</th>
              <th className={'hopr-table-header-Status'}>Status</th>
              <th className={'hopr-table-header-MetaMask'}>MetaMask Network Settings</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div>
                  <div>
                    {country}
                    {city && `, ${city}`}
                  </div>
                  {/*<div>*/}
                  {/*  /!*<iframe*!/*/}
                  {/*  /!*    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d156350.22604103578!2d19.00260!3d52.24388711124657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xd0889090081dc01!2zNTLCsDE0JzU0LjIiTiAyMcKwMDAnMDkuNCJF!5e0!3m2!1sen!2spl!4v1655291635152!5m2!1sen!2spl`}*!/*/}
                  {/*  /!*    className={'google-maps-iframe'}*!/*/}
                  {/*  /!*    width="250" height="150"  allowFullScreen="" loading="lazy"*!/*/}
                  {/*  /!*    referrerPolicy="no-referrer-when-downgrade">*!/*/}
                  {/*  /!*</iframe>*!/*/}
                  {/*</div>*/}
                </div>
              </td>
              <td className={'hopr-table-content-IP'}>{ip}</td>
              <td>{status}</td>
              <td>
                <dl>
                  <dt>Network Name</dt>
                  <dd>{name}</dd>
                  <dt>RPC Url</dt>
                  <dd id="rpc-url">{rpcUrl}</dd>
                  <dt>Chain ID</dt>
                  <dd>{chainId}</dd>
                </dl>
              </td>
            </tr>
          </tbody>
        </table>
      </Location>
      <Location>
        <table>
          <thead>
            <tr className={'hopr-table-header'}>
              <th className={'hopr-table-header-Timestamp'}>Timestamp</th>
              <th className={'hopr-table-header-type'}>Type</th>
              <th className={'hopr-table-header-User-Agent'}>User Agent</th>
              <th className={'hopr-table-header-Method'}>Method</th>
              <th className={'hopr-table-header-Params'}>Params</th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry, index) => {
              return (
                <tr key={`entry-${index}`}>
                  <td>{entry?.timestamp}</td>
                  <td>{entry?.type}</td>
                  <td>{entry?.userAgent}</td>
                  <td>{entry?.method}</td>
                  <td>
                    <pre>{entry.params && JSON.stringify(entry.params, null, 2)}</pre>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Location>
    </Fragment>
  );
}

export default App;
