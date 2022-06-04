import { errorToaster, successToaster } from '../components/components/Toasts'
import { BASE_URL, NETWORK_ERROR } from '../constants/Constants'

export const createUser = async (walletAddress) => {
  try {
    const body = { walletAddress: walletAddress }
    return await fetch(`${BASE_URL}users/createUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })
  } catch (err) {
    return NETWORK_ERROR
  }
}
export const fetchUser = async (walletAddress) => {
  try {
    const body = { walletAddress: walletAddress }
    const res = await fetch(`${BASE_URL}users/getUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (res.status === 200) {
      const data = await res.json()

      return data
    } else {
      console.log('Error')
    }
  } catch (err) {
    return NETWORK_ERROR
  }
}

export const updateUserProfile = async (requestBody) => {
  try {
    const body = requestBody
    return await fetch(`${BASE_URL}users/updateUser`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })
  } catch (err) {
    return NETWORK_ERROR
  }
}
export const postLikedNft = async (nft) => {
  const signer = localStorage.getItem('@signer')
  try {
    const body = { walletAddress: signer, nft: nft }
    const res = await fetch(`${BASE_URL}liked-nft/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (res.status === 200) {
      const data = await res.json()
      return data
    } else {
      errorToaster('Please Connect To Wallet')
    }
  } catch (err) {
    return NETWORK_ERROR
  }
}

export const followSeller = async (walletAddress, follower) => {
  try {
    const body = { walletAddress: walletAddress, follower: follower }
    const res = await fetch(`${BASE_URL}users/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (res.status === 200) {
      const data = await res.json()
      return data
    } else {
      errorToaster('Please Connect To Wallet')
    }
  } catch (err) {
    return NETWORK_ERROR
  }
}

export const updateSellerAmount = async (walletAddress, amount) => {
  try {
    const body = { walletAddress: walletAddress, amount: amount }
    const res = await fetch(`${BASE_URL}users/updateAmount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (res.status === 200) {
      const data = await res.json()
      console.log(data)
      return data
    } else {
      console.log('Network error')
    }
  } catch (err) {
    return NETWORK_ERROR
  }
}

export const createNftService = async (nft) => {
  try {
    const body = { ...nft }
    const res = await fetch(`${BASE_URL}nft/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (res.status === 200) {
      const data = await res.json()
      successToaster('Nft Created SuccessFully')
      return data
    } else {
      console.log('Network error')
    }
  } catch (err) {
    return NETWORK_ERROR
  }
}

export const fetchAllUsers = async () => {
  try {
    const res = await fetch(`${BASE_URL}users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
    if (res.status === 200) {
      const data = await res.json()
      return data
    } else {
      console.log('Error')
    }
  } catch (err) {
    return NETWORK_ERROR
  }
}
