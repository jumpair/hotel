var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var uniacid = app.siteInfo.uniacid;
    var url = wx.getStorageSync('navurl');
    this.setData({
      url:url
    })
    app.util.request({
      url: 'entry/wxapp/TabBar',
      data: {
        m: 'yyf_hotel',
        uniacid: uniacid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          var blist = res.data.data;
        
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: blist.tcolor
          });
        }
      }
    });

  }

})