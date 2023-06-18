import { useContractReads } from 'wagmi';

import { Message } from './Message.js';

export function LoadMessages({ addresses, contract }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: addresses.map(address => [
    {
      ...contract,
      functionName: 'getMsg',
      args: [address],
    },
    {
      ...contract,
      functionName: 'sortedCount',
      args: [address],
    },
    {
      ...contract,
      functionName: 'unsortedCount',
      args: [address],
    },
    ]).flat(),
  });
  if(isLoading) return (
    <div>Loading...</div>
  );
  else if(isError) return (
    <div>Error!</div>
  );
  else if(data) return addresses.map((address, addrIndex) => (
      <Message
        key={address}
        contract={contract}
        item={Object.assign({ address, id:address }, data[addrIndex * 3].result, {
          sortedCount: data[addrIndex * 3 + 1].result,
          unsortedCount: data[addrIndex * 3 + 2].result,
        })}
      />
    ));
}

export function UserMessages({ address, contract }) {
  // TODO add pagination
  const { data, isError, isLoading } = useContractReads({
    contracts: [{
      ...contract,
      functionName: 'fetchUserMessages',
      args: [address, 0n, 10n],
    }],
  });
  if(isLoading) return (<div>Loading...</div>);
  else if(isError) return (<div>Error!</div>);
  else if(data) return (<LoadMessages addresses={data[0].result[0]} contract={contract} />);
}
