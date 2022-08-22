 var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../../wxParse/wxParse.js');
Page({
  firstIndex: -1,
  data:{
    bannerApp:true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, //tab切换  
    productId:0,
    itemData:{},
    bannerItem:[],
    buynum:1,
    // 产品图片轮播
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    // 属性选择
    firstIndex: -1,
    //准备数据
    //数据结构：以一组一组来进行设定
     commodityAttr:[],
     attrValueList: [],
    bottomHeight: '70rpx',
    sid:0,//商家sid
  },


  // 传值
  onLoad: function (options) {
    app.util.handleTabbar('');
    let sid=options.sid;     
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.util.getuid(app.siteInfo.uniacid);
    }
    app.util.handleTabbar('');
    var that = this;
    that.setData({
      productId: options.productId,
      sid:sid
    });
    that.getProduct();

  },
  getProduct:function(){
    var that = this;
    app.util.request({
      url: 'entry/wxapp/detail',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        pid: that.data.productId,
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          console.log(res.data);
          var pro = res.data.data.pro;
          var content = pro.content;
          WxParse.wxParse('content', 'html', content, that, 5);
          that.setData({
            itemData: pro,
            bannerItem: res.data.data.bannerItem
          });
          
        }
      }
    });  
  },
  scoreAction:function(e){
    wx.redirectTo({
      url: '../shoporder/pay?cartId=' + this.data.itemData.id + '&buynum=' + this.data.buynum + '&mode=2'
    });
  },
  addCart:function(e){
    var openid = wx.getStorageSync('openid');
    var that = this;
    app.util.request({
      url: 'entry/wxapp/cart',
      data: {
        m: 'fy_jiu',
        op: 'add',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        pid: that.data.productId,
        num: that.data.buynum,
        kind:0,
        sid:this.data.sid
        
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });  
  },
  // 弹窗
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })

    this.animation = animation
    animation.translateY(300).step();

    this.setData({
      animationData: animation.export()
    })

    if (e.currentTarget.dataset.status == 1) {

      this.setData(
        {
          showModalStatus: true
        }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
  },
  // 加减
  changeNum: function (e) {
    var that = this;
    if (e.target.dataset.alphaBeta == 0) {
      if (this.data.buynum <= 1) {
        buynum: 1
      } else {
        this.setData({
          buynum: this.data.buynum - 1
        })
      };
    } else {
      this.setData({
        buynum: this.data.buynum + 1
      })
    };
  },


  
  addShopCart:function(e){ //添加到购物车
    wx.redirectTo({
      url: '../shoporder/pay?cartId=' + this.data.itemData.id+'&buynum='+this.data.buynum+'&mode=2'+'&sid='+this.data.sid
    });
  },
  bindChange: function (e) {//滑动切换tab 
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  initNavHeight:function(){////获取系统信息
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed:function(){
    this.setData({
      bannerApp:false,
    })
  },
  swichNav: function (e) {//点击tab切换
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  navShopIndex:function(){
    wx.navigateTo({
      url: '../shop/shop',
    })
  },
  navCart: function () {
    wx.navigateTo({
      url: '../cart/cart?kind=0&sid='+this.data.sid,
    })
  },

  onShareAppMessage: function (res) {
    return {
      title: this.data.itemData.name,
      path: '/fy_jiu/pages/product/detail?productId='+this.data.productId+'&sid='+this.data.sid
    }
  },

  copy_action: function () {
    var copy = this.data.blist.copyright
    if (copy.copy_kind == '1') {
      var phone = copy.copy_phone
      wx.makePhoneCall({
        phoneNumber: phone,
      })
    }
    if (copy.copy_kind == '2') {
      var appid = copy.copy_appid;
      var pageaddress = copy.copy_ddress;
      wx.navigateToMiniProgram({
        appId: appid,
        path: pageaddress,
        success(res) {
        }
      })

    }
  }


});
