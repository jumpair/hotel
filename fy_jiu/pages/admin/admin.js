var app = getApp()
Page({
  data: {
    list: {},
    currentTabsIndex: 10,
    currentCatId: 0,
    uniacid: 0,
    orderCode: '',
    isShow: false,
    isAdmin: false
  },
  onLoad: function (options) {
    console.log('1');
    var uniacid = app.siteInfo.uniacid;
    this.setData({
      uniacid: uniacid
    })
    this.vailAdmin();

    //this.loadData();
  },

  vailAdmin: function () {
    var that=this;
    app.util.get('entry/wxapp/Admin', {op:'vailadmin'}).then(res => {
      if (res.data != '0') {
        that.setData({
          isAdmin: true
        })
        that.loadData();
      } else {
        that.notice('没有权限进行此操作！');
      }
    })

    // var that = this;
    // var uniacid = that.data.uniacid
    // var openid = wx.getStorageSync('openid');
    // app.util.request({
    //   url: 'entry/wxapp/Admin',
    //   data: {
    //     m: 'fy_jiu',
    //     uniacid: uniacid,
    //     openid: openid,
    //     op:'vailadmin'
    //   },
    //   cachetime: 0,
    //   success: function (res) {
    //     if (res.data=='0') {
    //       that.setData({
    //         isAdmin: true
    //       })
    //       that.loadData();
    //     }else{
    //       that.notice('没有权限进行此操作！');
    //     }
    //   }
    // });
  },
  loadData: function () {
    var that = this;
    var uniacid = that.data.uniacid
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/Admin',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        op: 'list',
        openid: wx.getStorageSync('openid'),
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        if (!res.data.errno) {
          that.setData({
            list: res.data.data
          })
        }
      }
    });
  },
  notice: function (str) {
    wx.showModal({
      title: str,
      content: '',
      success: function (res) {
        wx.navigateTo({
          url: '../index/index'
        })
      }
    })
  },
  navOrderInfo: function (event) {
    var oid = event.currentTarget.dataset.oid;
    wx.navigateTo({
      url: 'orderinfo/orderinfo?oid=' + oid
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.vailAdmin();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },









})