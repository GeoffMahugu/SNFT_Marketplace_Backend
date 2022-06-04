export const isNftLikedByUser = (id, likedNfts) => {
  const signer = localStorage.getItem('@signer')

  if (signer) {
    let userLikedNfts = []

    userLikedNfts = likedNfts?.nfts?.filter((nft) => nft.id === id + signer)

    return userLikedNfts?.length > 0
  } else {
    return false
  }
}

export const countNftLikes = (id, likedNfts) => {
  let userLikedNfts = []

  userLikedNfts = likedNfts?.nfts?.filter((nft) => nft?.nft?.itemId === id)

  return userLikedNfts?.length
}
