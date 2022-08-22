var app = getApp();
// pages/order/downline.js
Page({
  data:{
    itemData:{},
    userId:0,
    cartId:0,
    btnDisabled:false,
    productData:[],
    address:{},
    total:0,
    addemt:1,
    vou:[],
    numtotal:0,
    saletotal:0,
    actualTotal:0,
    useCouponTotal:0,
    coupon:[],
    mark:'',
    closeAddress:0,
    sendRoom:0,
    mode:0, //判断是直接购买还是购买车购买
    buynum:0,//如果是购物车购买，这里存储数量
    score:0,//当前用户的积分数，
    exchange:0,
    show_balance:1,
    balance:0,
    check_balance:0,
    kind:0,//区分是商城还是diancan
    sid:0,//商家sid
    food_where:'',//送到房间还是餐桌
    markName:'备注',//如果是diancan，那么把备注表单框改为房间号
    day:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],//一天的小时数
    hourList:[],
    currentHour:0,//默认送达时间
  },
  onLoad:function(options){
    var mode = options.mode;
    let sid=options.sid;
    this.setData({
      cartId: options.cartId,
      mode:mode,
      sid:sid
    });
    var kind=options.kind;
    if(kind==1){  //如果是diancan，那就不显示收货地址
        this.setData({
          sendRoom:1,
          closeAddress:1,
        })
    }else{
      kind=0;
    }
    this.setData({
      kind:kind
    })
    if(mode=='2'){
      this.setData({
        buynum: options.buynum,
      });
    }
     //如果客户通过房间点餐二维码进入的，那么将房间号存入
     if(options.roomno){
      this.setData({
        mark:options.roomno
      })
    }

    var myDate = new Date();

    let currentHour=myDate.getHours();       
    let hourList=[];
    let day=this.data.day;
    for(var i=0;i<=day.length;i++){
      if(day[i]>=currentHour){
        hourList.push(day[i])
      }
    }
    this.setData({
      hourList:hourList,
      currentHour:hourList[0]
    })
    
    this.loadProductDetail1(kind);
  },

  loadProductDetail1: function (kind) {
    var that = this;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/shoporder',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        cartid: that.data.cartId,
        mode:that.data.mode,
        buynum:that.data.buynum,
        kind:kind,
        sid:that.data.sid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            address: res.data.data.address,
            productData: res.data.data.carts,
            total: res.data.data.total,
            numtotal: res.data.data.numtotal,
            saletotal: res.data.data.saletotal,
            actualTotal: res.data.data.actualtotal,
            actualTotal2: res.data.data.actualtotal,
            score:res.data.data.score,
            balance: res.data.data.balance,
            food_where:res.data.data.food_where
          });
          if(that.data.kind==1){
            that.setData({
              markName:res.data.data.food_where
            })
          }
        }
        that.handleStyle(res.data.data.tcolor);
      }
    });
  },
  submitOrder: function () {
    if(!this.checkAddress()){
        return false;
    }
    var item = this.data;
    var that = this;
    var openid = wx.getStorageSync('openid');
    var cid,mark;
    item.coupon.id === undefined ? cid = '0' : cid = item.coupon.id
    item.mark === undefined ? mark = '' : mark = item.mark
    if(item.sendRoom && item.mark==''){
      this.notice('房间号必须填写哦');
      return false;
    }
    app.util.request({
      url: 'entry/wxapp/addShopOrder',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        cid: cid,
        total: item.total,
        saletotal: item.saletotal,
        actualTotal: item.actualTotal,
        mark: mark,
        phone:item.address.phone,
        username:item.address.username,
        province:item.address.province,
        city:item.address.city,
        county:item.address.county,
        address:item.address.address,
        cartid: item.cartId,
        arrival:0,
        coupontotal: item.useCouponTotal,
        mode:item.mode,
        buynum: item.buynum,
        sendroom: item.sendRoom,
        exchange:item.exchange,
        check_balance: item.check_balance,
        kind:item.kind,
        sid:item.sid,
        sendtime:item.currentHour
      },
      cachetime: 0,
      success: function (res) {
        if (res.data == '999') {
          wx.showModal({
            title: '该优惠券已经使用，请到会员中心我的订单里支付。再次下单将会按原价支付',
            content: '',
            success: function (res) {
              var actualTotal = that.data.actualTotal2;
              that.setData({
                cid: '0',
                coupon: {},
                actualTotal: actualTotal
              })
            }
          })
        }

        if (res.data.errno) {
          //返回使用优惠券之前的价格 cid重置为0
          var total = that.data.total + that.data.useCouponTotal
          that.setData({
            total: total,
            cid: 0,
            coupon: {}
          })
          return false;
          //that.notice(res.data.message);
        }
        if (!res.data.errno) {
          //判断是否到店付款
          if (res.data.data.arrival != '0') {
            wx.showModal({
              title: '预订成功',
              content: '预订成功',
              success: function (res) {
                that.clearcarts();
                wx.reLaunch({
                  url: '../shopman/shopman',
                })
              }
            })

          }else if(res.data.data.exchange=='1'){
            wx.showModal({
              title: '提示',
              content: '兑换成功',
              success: function (res) {
                that.clearcarts();
                wx.reLaunch({
                  url: '../shopman/shopman',
                })
              }
            })
          } else if (res.data.data.check_balance == '1') {
            that.setData({
              balance: res.data.data.balance
            })
            wx.showModal({
              title: '支付成功',
              content: '支付成功',
              success: function (res) {
                that.clearcarts();
                wx.reLaunch({
                  url: '../shopman/shopman',
                })
              }
            })
          } else {
            var ordersn = res.data.data.ordersn;
            var url = app.siteInfo.siteroot;
            url = url.split('/app/')[0];
            var url1 = url;
            url = url + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/jsapi.php';
            var notifyUrl = url1 + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/test.php';
            wx.request({
              url: url,
              data: {
                openid: openid,
                price: item.actualTotal,
                ordersn: ordersn,
                notifyUrl: notifyUrl,
                roomname:'请到商城订单里查看'
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                var data = res.data;
                var pack = data.package.split('=')[1];
                wx.requestPayment({
                  'timeStamp': data.timeStamp,
                  'nonceStr': data.nonceStr,
                  'package': data.package,
                  'signType': 'MD5',
                  'paySign': data.paySign,
                  'success': function (res) {
                    that.clearcarts();
                    wx.reLaunch({
                      url: '../shopman/shopman',
                    })
                  },
                })
              }
            })
          }

        }
      }
    });
  },

  sendTimeChange: function (e) {
    var hindex = parseInt(e.detail.value);
    this.setData({
      currentHour:this.data.hourList[hindex]
    })
   


  },
  exchangeScoreAction:function(e){
    var score=parseInt(this.data.score);//用户积分数
    var scoretotal=parseInt(this.data.productData[0]['scoretotal']);//商品兑换需要用到的积分数
    if (e.detail.value) {
      if (scoretotal>score){
        this.notice('积分不够，请用其他支付方式');
        this.setData({
          exchange: 0
        })
        return false;
      }else{
        score = score -scoretotal;
        this.setData({
          exchange: 1,
          score: score,
          check_balance:0,
        })
      }
    }else{
      score = score + scoretotal;
      this.setData({
        exchange: 0,
        score: score,
     
      })
    }
  },
  //余额支付转换函数
  balanceChange: function (e) {
    var balance = parseFloat(this.data.balance);
    var check_balance = this.data.check_balance;
    if (balance == 0.00) {
      this.notice('没有余额哦！');
      this.setData({
        check_balance: 0
      })
      return false;
    }
    if (e.detail.value) {
      check_balance = 1
      this.setData({
        check_balance: check_balance,
        exchange:0
      })
      if (check_balance) {
        var total = parseFloat(this.data.total);
        if (balance < total) {
          this.notice('余额不足，请先充值或者使用在线支付');
          this.setData({
            check_balance: 0
          })
        }
      }
    } else {
      check_balance = 0
      this.setData({
        check_balance: check_balance
      })

    }
  },
  //弹出提示框方法
  notice: function (str) {
    wx.showModal({
      title: str,
      content: '',
      success: function (res) {
      }
    })
  },
  checkAddress:function(){
      if(this.data.address.isnull && !this.data.sendRoom){
        wx.showModal({
          title: '提示',
          content: '收货地址不能为空',
          success: function (res) {
             return false;
          }
        })
      }else{
        return true;
      }
  },
  choiceAddressAction:function(event){
    wx.navigateTo({
      url: 'address/address',
    })
  },
  sendRoom: function (e) {
    var sendRoom = 0;
    var closeAddress = this.data.closeAddress;
    if (e.detail.value) {
      sendRoom = 1;
      closeAddress=1;
    }else{
      closeAddress = 0;
    }
    this.setData({
      sendRoom: sendRoom,
      closeAddress: closeAddress
    })
  },
  navCoupon:function(event){
    wx.navigateTo({
      url: 'ordercoupon/ordercoupon' + '?total=' + this.data.actualTotal,
    })
  },

//微信支付
  createProductOrderByWX:function(e){
    this.setData({
      paytype: 'weixin',
    });

    this.createProductOrder();
  },

  //线下支付
  createProductOrderByXX:function(e){
    this.setData({
      paytype: 'cash',
    });
    wx.showToast({
      title: "线下支付开通中，敬请期待!",
      duration: 3000
    });
    return false;
    this.createProductOrder();
  },

  //确认订单
  createProductOrder:function(){
    this.setData({
      btnDisabled:false,
    })

    //创建订单
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Payment/payment',
      method:'post',
      data: {
        uid: that.data.userId,
        cart_id: that.data.cartId,
        type:that.data.paytype,
        aid: that.data.addrId,//地址的id
        remark: that.data.remark,//用户备注
        price: that.data.total,//总价
        vid: that.data.vid,//优惠券ID
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data        
        var data = res.data;
        if(data.status == 1){
          //创建订单成功
          if(data.arr.pay_type == 'cash'){
              wx.showToast({
                 title:"请自行联系商家进行发货!",
                 duration:3000
              });
              return false;
          }
          if(data.arr.pay_type == 'weixin'){
            //微信支付
            that.wxpay(data.arr);
          }
        }else{
          wx.showToast({
            title:"下单失败!",
            duration:2500
          });
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！err:createProductOrder',
          duration: 2000
        });
      }
    });
  },

  //调起微信支付
  wxpay: function(order){
      wx.request({
        url: app.d.ceshiUrl + '/Api/Wxpay/wxpay',
        data: {
          order_id:order.order_id,
          order_sn:order.order_sn,
          uid:this.data.userId,
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type':  'application/x-www-form-urlencoded'
        }, // 设置请求的 header
        success: function(res){
          if(res.data.status==1){
            var order=res.data.arr;
            wx.requestPayment({
              timeStamp: order.timeStamp,
              nonceStr: order.nonceStr,
              package: order.package,
              signType: 'MD5',
              paySign: order.paySign,
              success: function(res){
                wx.showToast({
                  title:"支付成功!",
                  duration:2000,
                });
                setTimeout(function(){
                  wx.navigateTo({
                    url: '../user/dingdan?currentTab=1&otype=deliver',
                  });
                },2500);
              },
              fail: function(res) {
                wx.showToast({
                  title:res,
                  duration:3000
                })
              }
            })
          }else{
            wx.showToast({
              title: res.data.err,
              duration: 2000
            });
          }
        },
        fail: function() {
          // fail
          wx.showToast({
            title: '网络异常！err:wxpay',
            duration: 2000
          });
        }
      })
  },
  markAction: function (e) {
    this.setData({
      mark: e.detail.value
    })
  },
  handleStyle: function (tcolor) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: tcolor,
    });
  },

  clearcarts:function(){
    var openid = wx.getStorageSync('openid');
    var cartids = wx.getStorageSync('cartids');
    app.util.request({
      url: 'entry/wxapp/cart',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        cartid: cartids,
        op: 'delafterorder',
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          wx.removeStorage({
            key: 'cartids',
            success: function(res) {},
          })
        }
      }
    });
  }

});