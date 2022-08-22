var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    table: ["待审核", "到余额", "到账户", "不同意"],
    nav_width: "",
    activeIndex: 0,
    cash: false,
    items: [{
        name: '0',
        value: '余额',
        checked: 'true'
      },
      {
        name: '1',
        value: '微信',

      },
    ],
    list:[],
    money:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.setData({
    //   nav_width: 100 / this.data.table.length,
    //   tixian: options.tixian
    // })
    // if (options.id) {
    //   this.data.activeIndex = options.id;
    //   this.setData({
    //     activeIndex: options.id
    //   })
    // }

    this.getmydistribution();
  },

  getmydistribution: function () {
    var that = this;
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');

    app.util.request({
      url: 'entry/wxapp/MyDistribution',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
      },
      cachetime: 0,
      success: function (res) {
        console.log(res.data.data)
        that.setData({
          list: res.data.data.list,
          money:res.data.data.allprice
        });
      }
    });
  },


  ActiveClick: function(e) {
    this.setData({
      activeIndex: e.currentTarget.dataset.index,
      list: this.data.listOk,
    })
    // this.getDrawRecord(this.data.activeIndex);
  },
  backCashTap: function(e) {
    // console.info(e);
    // console.info(e.target.dataset.id);
    // return;

    wx.navigateTo({
      url: '../tixian/tixian?id=' + e.target.dataset.id,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})