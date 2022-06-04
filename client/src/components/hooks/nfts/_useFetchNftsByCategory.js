import { useQuery } from "react-query";

import { ethers } from "ethers";
import axios from "axios";
import { nftaddress, nftmarketaddress, RPC_URL } from "../../../config";

import NFT from "../../../contracts/NFT.json";
import Market from "../../../contracts/NFTMarket.json";

export default function useFetchNftsByCategory(category) {
    return useQuery(
        ["nfts_by_category", category],
        () => getMarketPlaceNftsByCategory(category),
        {
            enabled: category !== "",
        }
    );
}

const getMarketPlaceNftsByCategory = async (cat) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const tokenContract = new ethers.Contract(
            nftaddress,
            NFT.abi,
            provider
        );
        const marketContract = new ethers.Contract(
            nftmarketaddress,
            Market.abi,
            provider
        );
        const data = await marketContract.fetctNFTsByCatgory(cat);

        const items = await Promise.all(
          data
            ?.filter((i) => i.tokenId.toString() !== '0')
            .map(async (i) => {
              const tokenUri = await tokenContract.tokenURI(i.tokenId);
              const meta = await axios.get(tokenUri);
              let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
              let item = {
                price,
                itemId: i.itemId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                title: meta.data.title || meta.data.name,
                description: meta.data.description,
                isVideo: meta?.data?.isVideo,
                auction: i.auction,
                category: i.category,
              };
              return item;
            })
        );

        return items ? items : [];
    } catch (error) {
        console.log(error.message);
    }
};
