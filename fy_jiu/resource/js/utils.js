const getTopHeight = () =>{
    // let statusBarHeight;
    // wx.getSystemInfo({
    //   success: (res) => {
    //       console.log(res)
    //       statusBarHeight = res.statusBarHeight
    //   },
    // })
    const jnInfo = wx.getMenuButtonBoundingClientRect()
    return {jnInfo}
}
module.exports = {
    getTopHeight
}
