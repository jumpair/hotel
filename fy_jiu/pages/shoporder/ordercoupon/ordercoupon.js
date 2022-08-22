var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:{},
    isnull:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    
    app.util.request({
      url: 'entry/wxapp/coupon',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        op: 'ordercoupon',
        op1:'shop',
        openid: openid,
        total: options.total,
        sid:wx.getStorageSync('sid')
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            list: res.data.data.list,
            isnull: res.data.data.isnull
          })
        }
      }
    });
  },
  receive_btn: function(event){
    var isuse = event.currentTarget.dataset.isuse;
    var id = event.currentTarget.dataset.id;
    var list = this.data.list[id];
    var pages = getCurrentPages();
    var prepages = pages[pages.length - 2];
  
    var total = prepages.data.actualTotal2;
    var useCouponTotal = prepages.data.useCouponTotal;
    //判断优惠券重复使用问题
   
    if(isuse=='1'){
      if (prepages.data.coupon.length!=0){
        if (prepages.data.coupon['id'] == list['id']) {
          wx.navigateBack({
            delta: 1,
          });
          return false;
        }
      }
      var couponMoney = parseFloat(list['money']);
      if (list['type']=='0'){
        if (couponMoney >= total){
          useCouponTotal = total
          total=0;
          
        }else{
          total = total - couponMoney
          useCouponTotal = couponMoney
        }
      }else{
        var money = list['money'];
        if (money.indexOf('.')!=-1){
          var arr= money.split('.');
          money = parseFloat('0.'+arr[0]+arr[1]);
        }else{
          money = parseFloat('0.' + money);
        }
        total = total * money;
        useCouponTotal = total - (total * money)
      }
      total = total.toFixed(2);
      
      prepages.setData({
        coupon: list,
        actualTotal: total,
        useCouponTotal: useCouponTotal
      })
    }
    if(isuse=='cancel'){
      if (useCouponTotal){
        var actualTotal=prepages.data.actualTotal2;
        prepages.setData({
          coupon: [],
          actualTotal: actualTotal,
          useCouponTotal: 0
        })
      }
    }

    wx.navigateBack({
      delta: 1,
    })
  },

})