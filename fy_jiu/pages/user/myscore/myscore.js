var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      list:{},
      isnull :0,
    bottomHeight: '70rpx',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.util.handleTabbar('myscore');
    this.loadData(0);
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.loadData(1);
  },
  loadData: function (ispull){
    var that = this
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/Score',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            list: res.data.data.list,
            isnull: res.data.data.isnull
          })
          if (ispull) { wx.stopPullDownRefresh(); wx.stopPullDownRefresh(); }
        }
      }
    });
  },


  tabNav: function (event) {
    var url = event.currentTarget.dataset.url;
    if (url.indexOf('https')!='-1'){
      wx.setStorageSync('navurl', url)
      wx.navigateTo({
        url: '../webview/webview',
      })
    }else{
      wx.navigateTo({
        url: url,
      })
    }
  },
  
})