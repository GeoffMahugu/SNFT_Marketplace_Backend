export const getFollowingUsers = (users) => {
  let followingUsers = []
  if (users) {
    const signer = localStorage.getItem('@signer')

    for (let i = 0; i < users.length; i++) {
      if (users[i].walletAddress !== signer) {
        if (users[i].followers.includes(signer)) {
          followingUsers.push(users[i])
        }
      }
    }
  }
  return followingUsers
}

export const getFollowers = (followers, users) => {
  let followerUsers = []
  if (followers && users) {
    followers.forEach((follower) => {
      let user = users.filter((usr) => usr.walletAddress === follower)
      if (user.length > 0) {
        followerUsers.push(user[0])
      }
    })
  }
  return followerUsers
}
