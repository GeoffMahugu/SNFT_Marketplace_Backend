import useFetchLikedNfts from './_useFetchAllLikedNfts'

export default function useFetchUserLikedNfts() {
  const signer = localStorage.getItem('@signer')

  const { data: likedNfts, status } = useFetchLikedNfts()
  let userLikedNfts = []
  if (status === 'success') {
    userLikedNfts = likedNfts?.nfts?.filter(
      (nft) => nft.walletAddress === signer
    )
  }
  return userLikedNfts
}
