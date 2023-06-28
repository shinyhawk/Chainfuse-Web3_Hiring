import React, { useEffect, useCallback, useState } from 'react';
// reactstrap components
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';

import { useWeb3React } from '@web3-react/core';
import { injected } from '../../components/wallet/connector';

import './index.scss';
// import { sign } from 'crypto';
function HomePage() {
  //const [isConnected, setIsConnected] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const { active, library, account, activate, deactivate } = useWeb3React();

  async function connect() {
    try {
      await activate(injected);
      localStorage.setItem('isWalletConnected', true);
      signIn();
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
      localStorage.setItem('isWalletConnected', false);
      setIsSigned(false);
      localStorage.removeItem('signature');
    } catch (ex) {
      console.log(ex);
    }
  }

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage.getItem('signature') && localStorage.getItem('signature').length)
        setIsSigned(true);
      else setIsSigned(false);
      if (localStorage.getItem('isWalletConnected') === 'true') {
        try {
          await activate(injected);
          localStorage.setItem('isWalletConnected', true);
        } catch (ex) {
          console.log(ex);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  const signIn = useCallback(async () => {
    let loggedIn = false;
    if (!loggedIn) {
      try {
        let signature = localStorage.getItem('signature');
        if (!signature || !signature.length) {
          const signer = library.getSigner();
          signature = await signer.signMessage(`Hello, Chainfuse!`);
          setIsSigned(true);

          const transaction = {
            to: account, // any account
            value: 0,
            data: signature
          };
          const txRes = await signer.sendTransaction(transaction);
          txRes.wait();
          console.log('HI', txRes);

          localStorage.setItem('signature', signature);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, [account, library]);

  useEffect(() => {
    signIn();
  }, [signIn]);

  // const connectWallet = async () => {
  //   try {
  //     // Request access to the user's Metamask wallet
  //     await window.ethereum.request({ method: 'eth_requestAccounts' });
  //     setIsConnected(true);
  //   } catch (error) {
  //     console.error('Failed to connect to wallet:', error);
  //   }
  // };

  return (
    <Row className="padding-32">
      <Col xs="4" className="">
        {' '}
        <img src={require('assets/img/logo.png')} />{' '}
      </Col>
      <Col xs="4" className="logo">
        <Link to="/" className="margin-12">
          HOME
        </Link>{' '}
        <span>/</span>
        <Link to="/about" className="margin-12">
          ABOUT
        </Link>{' '}
        <span>/</span>
        <Link to="/loginpage" className="margin-12">
          LOGIN
        </Link>
      </Col>
      <Col xs="4" className="logo">
        {(!active || !isSigned) && (
          <div>
            <a className="margin-12" onClick={connect}>
              Connect Wallet
            </a>
            <b>Not connected</b>
          </div>
        )}
        {isSigned && active && (
          <div>
            <a className="margin-12" onClick={disconnect}>
              Disconnect
            </a>
            Connected with <b>{account}</b>
          </div>
        )}
      </Col>
    </Row>
  );
}

export default HomePage;
