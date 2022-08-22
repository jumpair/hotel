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
        openid: openid,
        total: options.total,
        rid:options.rid
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
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
    console.log(this.data.list[id]);
    var isuse = event.currentTarget.dataset.isuse;
    var id = event.currentTarget.dataset.id;
    var list = this.data.list[id];
    var pages = getCurrentPages();
    var prepages = pages[pages.length - 2];
    var roomInfo = prepages.data.roomInfo;
    var fuserprice = prepages.data.fuserprice;
    var total = 0;
    var deposit = parseFloat(prepages.data.list.deposit);
    var ylroomnums = prepages.data.roomNums;
    if(fuserprice == 0 && prepages.data.roomNums == 1){
      total += parseFloat(fuserprice) * prepages.data.roomNums
    }else{
      if(fuserprice == 0){
        
        prepages.data.roomNums = prepages.data.roomNums-1;
      }
      for (var i = 0; i < roomInfo.length; i++) {
        total += parseFloat(roomInfo[i]['mprice']) * prepages.data.roomNums
      }
    }

    
    // for (var i = 0; i < roomInfo.length; i++) {
    //   total += parseFloat(roomInfo[i]['mprice']) * prepages.data.roomNums
    // }
    var useCouponTotal = prepages.data.useCouponTotal;
    
    if(isuse=='1'){
      var couponMoney = parseFloat(list['money']);
      
      if (prepages.data.sale!='0.0') {
        var sale = parseFloat(prepages.data.sale) * 0.1;
        total = total * sale
      }
      
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
        if(money!='0'){
          if (money.indexOf('.')!=-1){
            var arr= money.split('.');
            money = parseFloat('0.'+arr[0]+arr[1]);
          }else{
            money = parseFloat('0.' + money);
          }
          var ystotal = total;
          total = total * money;

          useCouponTotal = ystotal - (ystotal * money)
        }
      }

      total += (prepages.data.roomNums * deposit);
      if (prepages.data.start_int == '1') {
        var num = 0;
      } else {
        var num = 2;
      }
      total = total.toFixed(num);
      console.log(list);
      prepages.setData({
        coupon: list,
        total: total,
        roomNums:ylroomnums,
        showCouponTotal:useCouponTotal.toFixed(2),
        useCouponTotal: useCouponTotal
      })
    }
    prepages.data.roomNums = ylroomnums;
    console.log(isuse)
    if(isuse=='cancel'){
      console.log(useCouponTotal)
      if (useCouponTotal){
        var currentTotal = total
        if (prepages.data.sale !='0.0') {
          var sale = parseFloat(prepages.data.sale) * 0.1;
          currentTotal = currentTotal * sale
        }
        currentTotal += (prepages.data.roomNums * deposit)
        var coupon=[];
        if (prepages.data.start_int == '1') {
          var num = 0;
        } else {
          var num = 2;
        }
        currentTotal = currentTotal.toFixed(num);
        console.log(coupon)
        prepages.setData({
          coupon: coupon,
          total: currentTotal,
          roomNums:ylroomnums,
          useCouponTotal: 0
        })
      }
      if(fuserprice == 0){
        var coupon=[];
        var currentTotal = 0;
        prepages.setData({
          coupon: coupon,
          total: currentTotal,
          roomNums:ylroomnums,
          useCouponTotal: 0
        })
      }
    }

 
    wx.navigateBack({
      delta: 1,
    })
  },
  cancelCoupon: function (){

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})