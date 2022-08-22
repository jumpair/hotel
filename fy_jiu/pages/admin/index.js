var app = getApp()
import urils from '../../resource/js/utils.js'
Page({

  data: {
    shop:[],
    statistics:[]
  },

  onLoad: function (options) {
    var openid = wx.getStorageSync('openid');
    if (!openid){
      app.userLogin().then(res => {
        this.loadData();
      })
    }else{
      this.loadData();
    }
    this.setData({
      jnInfo:urils.getTopHeight().jnInfo,
    })
  },


  loadData: function(){
    let that=this;
    app.util.get('entry/wxapp/adminIndex').then(res => {
      console.log(res);
      if (res.data!='0') {
         that.setData({
           shop:res.data.shop,
           statistics:res.data.statistics
         }) 
      }else{
        that.notice('没有权限进行此操作！');
      }
    })
  },
  hotelums(){
    var hotelid = this.data.shop.id;
    wx.navigateTo({
      url: './tixian/tixian?hotelid='+hotelid,
    })
  },
  navBack(){
    wx.navigateBack({
      delta: 0,
    })
  },
  getScancode: function () {
    
    
    wx.scanCode({
      success: (res) => {

      }
    })
 
  },
  man:function(){
    wx.navigateTo({
      url: './admin',
    })
  },
  navRoom:function(){
    wx.navigateTo({
      url: 'room/room',
    })
  }















})