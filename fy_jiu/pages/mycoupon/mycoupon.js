var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    isnull: 0,
    bottomHeight: '70rpx',
    currentTab: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.util.handleTabbar('mycoupon');
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        this.loadData();
      })
    } else {
      this.loadData();
    }
  },
  clickTab: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.current
    })
  },
  loadData: function () {
    var that = this
    app.util.request({
      url: 'entry/wxapp/coupon',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        op: 'getuserlist',
        openid: wx.getStorageSync('openid')
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        if (!res.data.errno) {
          that.setData({
            list: res.data.data.list,
            isnull: res.data.data.isnull
          })
        }
      }
    });
  },
  receive_btn: function(event){
    var that = this
    var uniacid = app.siteInfo.uniacid;
    var id = parseInt(event.currentTarget.dataset.cid);
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/coupon',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        op: 'receive',
        id:id,
        openid: openid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          wx.showModal({
            title: '领取成功',
            content: '可以在会员中心里查看',
          })
          that.setData({
            list: res.data.data,
          })
        }else{
          wx.showToast({
            title: res.data.message,
          })
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