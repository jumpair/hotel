var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    isnull: 0,
    bottomHeight: '70rpx',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let sid=options.sid;
    let sid=3;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        this.loadData(0,sid);
      })
    } else {
      this.loadData(0,sid);
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.loadData('1');
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  loadData: function (ispull,sid){
    var that = this
    var uniacid = app.siteInfo.uniacid;
    var ispull = ispull;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/coupon',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        op: 'list',
        openid: openid,
        sid:sid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
         
          that.setData({
            list: res.data.data.list,
            isnull:res.data.data.isnull
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
  onShareAppMessage: function (res) {
    return {
      title: '优惠券',
      path: '/fy_jiu/pages/coupon/coupon'
    }
  },




  
})