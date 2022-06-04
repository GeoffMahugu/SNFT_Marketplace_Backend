import { useQuery } from 'react-query';

export default function useIsWalletConnectUser() {
  return useQuery(['is_wallet_connect'], () => checkIfWalletConnectUser());
}

const checkIfWalletConnectUser = async () => {
  const isWalletConnectUser = localStorage.getItem('@walletconnect');
  return isWalletConnectUser;
};
