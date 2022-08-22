// fy_jiu/pages/follow/follow.js
var app = getApp();
Page({

  data: {
    list:[],
    full:false
  },

  onLoad: function (options) {
    app.util.handleTabbar('follow');
    let that=this;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        that.getContent();
      })
    }else{
      that.getContent();
    }
  },

  getContent:function(){
 
    app.util.get('entry/wxapp/follow',{'op':'list','position':wx.getStorageSync('position')}).then(res => {
    //console.log(res);
      this.setData({
        list:res.data.list,
        full:res.data.full
      })
    })
  },
  navHotel: function (event) {
    let id = event.currentTarget.dataset.id;
    let url = '../hotel/hotel?&id=' + id;
    app.util.nav(url);
  },
  //处理版权点击动作
  copy_action: function () {
    app.util.handelCopyAction();
  },
  //底部导航跳转
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