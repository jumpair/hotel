
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lowerList: 1,
    bottomHeight: '70rpx',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getsubordinates();
  },
  /***********************获取下级*************************** */
  getsubordinates: function () {
    var that = this;
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      console.info('lyj openid is null');
      return false;
    }
    app.util.request({
      url: 'entry/wxapp/getsubordinates',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
      },
      cachetime: 0,
      success: function (res) {
        var lowerList = res.data.data.subordinates;
        console.log(lowerList)
        if (!res.data.errno) {
          that.setData({
            lowerList: lowerList
          })
        }
      }
    });
  },
  /***********************获取下级*************************** */


  // 获取二级用户
  tanext: function(e){
    console.info('用户数据',e);
    console.info('用户数据', e.target.dataset.id);

    var openid = e.currentTarget.dataset.id;

    wx.navigateTo({ url: '../next/next?openid=' + openid});

  },



})