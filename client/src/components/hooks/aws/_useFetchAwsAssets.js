import { BASE_URL, NETWORK_ERROR } from '../../../constants/Constants';
import { useQuery } from 'react-query';
import axios from 'axios';

export default function useFetchAwsAssets() {
  return useQuery(['aws_assets'], () => fetchAwsAssets());
}

const fetchAwsAssets = async () => {
  try {
    const res = await fetch(`https://nsys.inf4mation.com/api/assets/search`, {
      method: 'get',
      headers: new Headers({
        'x-accessKeyId': 'AKIAYL6VP5R57W4UDVR5',
        'x-secretAccessKey': '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',
      }),
    });
    console.log(res);
    if (res.status === 200) {
      const data = await res.json();
      const items = await Promise.all(data?.results?.map(async d => {
        const meta = await fetch(
          `https://cloud.inf4mation.com/ipfs/${d.IPFSMetadataCID}`
        );
        const metaRes = await meta.json()
        return {
          ...d,
          ...metaRes,
        }
      }))
      return items;
    } else {
      console.log('Error');
    }
  } catch (err) {
    console.log(err);
    return NETWORK_ERROR;
  }
};
