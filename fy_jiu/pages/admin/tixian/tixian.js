var app = getApp()
import urils from '../../../resource/js/utils.js'
Page({

  data: {
    shh:'',
    name:''
  },

  onLoad: function (option) {
    var that = this;
    var openid = wx.getStorageSync('openid');
    var uniacid = app.siteInfo.uniacid;
    console.log(option)
    this.setData({
      jnInfo:urils.getTopHeight().jnInfo,
      hotelid:option.hotelid
    })
    app.util.request({
      url: 'entry/wxapp/subhoteltxums',
      data: {
        m: 'fy_jiu',
        op:'befor',
        uniacid: uniacid,
        hotelid: option.hotelid
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        that.setData({
          ssh:res.data.data.account,
          name:res.data.data.name
        })
      }
    }); 
   
  },
  navBack(){
    wx.navigateBack({
      delta: 0,
    })
  },
  changeShh(e){
    console.log(e)
    let shh = e.detail.value
    this.setData({
      shh
    })
  },
  changeName(e){
    console.log(e)
    let name = e.detail.value
    this.setData({
      name
    })
  },
  submit(){
    var openid = wx.getStorageSync('openid');
    var uniacid = app.siteInfo.uniacid;
    let shh = this.data.shh,name = this.data.name;
    let hotelid = this.data.hotelid;
    if(shh == ''){
      wx.showToast({ 
        title: '请输入商户号',
        icon:'error'
      })
      return false
    }
    if(name == ''){
      wx.showToast({
        title: '请输入姓名',
        icon:'error'
      })
      return false
    }
    app.util.request({
      url: 'entry/wxapp/subhoteltxums',
      data: {
        m: 'fy_jiu',
        op:'sub',
        uniacid: uniacid,
        account: shh,
        name: name,
        openid:openid,
        hotelid: hotelid
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        wx.showToast({
          title: res.data.message,
        })
      }
    }); 
  }
  

})