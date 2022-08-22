var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getData()
  },
  getData() {
    var that  = this
    var uniacid = app.siteInfo.uniacid;
    app.util.request({
      url: 'entry/wxapp/introduce',
      data: {
        uniacid
      },
      success: function (res) {
        that.setData({
          content:res.data.data.ptcontent
        })
      }
    })
  },
  onShareAppMessage() {

  }
})