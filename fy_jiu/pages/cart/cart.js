var app = getApp();
// pages/cart/cart.js
Page({
  data:{
    page:1,
    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    total: 0,
    carts: {},
    sid:0,//商家sid
  },
onLoad: function (options) {
  var openid = wx.getStorageSync('openid');
  var kind=options.kind;
  let sid=options.sid;
  this.setData({
    'sid':sid
  })
  if(!openid){
    app.userLogin().then(res => {})
  }else{
    this.loadProductData(openid,kind,sid);
  }


},
// 数据案例
loadProductData: function (openid,kind,sid) {
  var that = this;
  app.util.request({
    url: 'entry/wxapp/cart',
    data: {
      m: 'fy_jiu',
      uniacid: app.siteInfo.uniacid,
      openid: openid,
      kind:kind,
      sid:sid
    },
    cachetime: 0,
    success: function (res) {
      if (!res.data.errno) {
        var cart = res.data.data.carts
        that.setData({
          carts: cart
        });
       
        that.sum();
        that.handleStyle(res.data.data.tcolor);
      }
    }
  });  
},


bindMinus: function(e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index].num;
    var pid = that.data.carts[index].pid;
    var cart_id = e.currentTarget.dataset.cartid;
    var openid = wx.getStorageSync('openid');
    // 如果只有1件了，就不允许再减了
    if (num > 1) {
      num --;
      app.util.request({
        url: 'entry/wxapp/cart',
        data: {
          m: 'fy_jiu',
          uniacid: app.siteInfo.uniacid,
          openid: openid,
          op: 'minus',
          num: num,
          cartid: cart_id,
          pid: pid
        },
        cachetime: 0,
        success: function (res) {
          if (!res.data.errno) {
            var carts = that.data.carts;
            carts[index]['num'] = num;
            that.setData({
              carts: carts
            })
            that.sum();
          }
        }
      }); 
    }
    
},
bindPlus:function(e){
  var that = this;
  var index = parseInt(e.currentTarget.dataset.index);
  var num = that.data.carts[index].num;
  var pid = that.data.carts[index].pid;
  num++;
  var cart_id = e.currentTarget.dataset.cartid;
  var openid = wx.getStorageSync('openid');
  app.util.request({
    url: 'entry/wxapp/cart',
    data: {
      m: 'fy_jiu',
      uniacid: app.siteInfo.uniacid,
      openid: openid,
      op:'plus',
      num:num,
      cartid: cart_id,
      pid:pid
    },
    cachetime: 0,
    success: function (res) {
      if (!res.data.errno) {
        var carts = that.data.carts;
        carts[index]['num']=num;
        that.setData({
          carts:carts
        })
        that.sum();
      }
    }
  }); 
},


bindCheckbox: function(e) {
  /*绑定点击事件，将checkbox样式改变为选中与非选中*/
  //拿到下标值，以在carts作遍历指示用
  var index = parseInt(e.currentTarget.dataset.index);
  //原始的icon状态
  var selected = this.data.carts[index].selected;
  var carts = this.data.carts;
  // 对勾选状态取反
  carts[index].selected = !selected;
  // 写回经点击修改后的数组
  this.setData({
    carts: carts
  });
  this.sum()
},

bindSelectAll: function() {
   // 环境中目前已选状态
   var selectedAllStatus = this.data.selectedAllStatus;
   // 取反操作
   selectedAllStatus = !selectedAllStatus;
   // 购物车数据，关键是处理selected值
   var carts = this.data.carts;
   // 遍历
   for (var i = 0; i < carts.length; i++) {
     carts[i].selected = selectedAllStatus;
   }
   this.setData({
     selectedAllStatus: selectedAllStatus,
     carts: carts
   });
   this.sum()
 },

bindCheckout: function() {
   // 初始化toastStr字符串
   var toastStr = '';
   // 遍历取出已勾选的cid
   for (var i = 0; i < this.data.carts.length; i++) {
     if (this.data.carts[i].selected) {
       toastStr += this.data.carts[i].id;
       toastStr += ',';
     }
   }
   if (toastStr==''){
     wx.showToast({
       title: '请选择要结算的商品！',
       duration: 2000
     });
     return false;
   }
   //存回data
   wx.navigateTo({
     url: '../shoporder/pay?cartId=' + toastStr+'&mode=1&sid='+this.data.sid,
   })
 },

 bindToastChange: function() {
   this.setData({
     toastHidden: true
   });
 },

sum: function() {
    var carts = this.data.carts;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        total += carts[i].num * carts[i].price;
      }
    }
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
      total: '¥ ' + total
    });
  },

// 数据案例
removeShopCard: function (e) {
  var that = this;
  var cartId = e.currentTarget.dataset.cartid;
  var openid = wx.getStorageSync('openid');
  wx.showModal({
    title: '提示',
    content: '你确认移除吗',
    success: function (res) {
      if (!res.cancel){
        app.util.request({
          url: 'entry/wxapp/cart',
          data: {
            m: 'fy_jiu',
            uniacid: app.siteInfo.uniacid,
            openid: openid,
            op: 'del',
            cartid: cartId
          },
          cachetime: 0,
          success: function (res) {
            if (!res.data.errno) {
              that.loadProductData(openid);
            }
          }
        });  
      }
      
    }
  })
  
},





handleStyle: function (tcolor) {
  wx.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: tcolor,
  });
},

})