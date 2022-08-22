var app = getApp();
// pages/order/downline.js
Page({
  data: {
     list:{},
  },
  onLoad: function (options) {
 
    this.loadUserAddress();
  },

  loadUserAddress: function () {
    var that = this;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/address',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        op:'list'
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            list:res.data.data.list
          });
        }
      }
    });
  },

   //用户选择收货地址
  getAddress: function () {
    var that = this;
    if (wx.chooseAddress) {
      wx.chooseAddress({
        success: function (res) {
    
          that.addAddress(res)
        },
        fail: function (err) {
          wx.showToast({
            title: '授权失败，您将无法进行下单支付;重新授权请删除小程序后再次进入',
            icon: 'success',
            duration: 20000
          })
        }
      })
    } else {
      console.log('当前微信版本不支持chooseAddress');
    }
  },

  addAddress: function(address){
    var that = this;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/address',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        op:'add',
        openid: openid,
        username: address.userName,
        phone: address.telNumber,
        province: address.provinceName,
        city: address.cityName,
        county: address.countyName,
        address: address.detailInfo
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.loadUserAddress();
        }
      }
    });
  },
  defaultAction: function (event){
    var id = event.currentTarget.dataset.id;
    var op = event.currentTarget.dataset.op;
    var aid = this.data.list[id]['id'];
    var openid = wx.getStorageSync('openid');
    var that=this;
    console.log(aid);
    app.util.request({
      url: 'entry/wxapp/address',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        op: op,
        openid: openid,
        aid:aid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.loadUserAddress();
        }
      }
    });
  },

  choiceAddress: function(event){
    var pages = getCurrentPages();
    var id = event.currentTarget.dataset.id;
    var address = this.data.list[id];
    var prepages = pages[pages.length - 2];
    prepages.setData({
      address: address
    }),
    wx.navigateBack({
      
    })
  }



});