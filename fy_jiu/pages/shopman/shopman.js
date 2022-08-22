var app = getApp()
Page({
  data: {
    list: {},
    currentTabsIndex: 10,
    currentCatId: 0,
    uniacid: 0,
    orderCode: '',
    isShow: false,
    bottomHeight: '70rpx',
  },
  catClick: function (event) {
    var sid = event.currentTarget.dataset.sid;
    this.setData({
      currentTabsIndex: sid
    })
    if (sid == '6') {
      sid = '3,4,6'
    }
    this.loadData(sid);
  },
  onLoad: function (options) {
    this.getTabbar();
    var uniacid = app.siteInfo.uniacid;
    this.setData({
      uniacid: uniacid
    })
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        this.loadData(10);
      })
    } else {
      this.loadData(10);
    }
  },
  loadData: function (status) {
    var that = this;
    var uniacid = that.data.uniacid
    var openid = wx.getStorageSync('openid');

    app.util.request({
      url: 'entry/wxapp/MyOrder',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
        status: status
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            list: res.data.data
          })
        }
      }
    });
  },
  navProduct(event){
   let pid=event.currentTarget.dataset.id;
   let kind=event.currentTarget.dataset.kind;
   let sid=event.currentTarget.dataset.sid;
   if(kind!=1){
     app.util.nav('../product/detail?sid='+sid+'&productId='+pid);
   }else{
    app.util.nav('../orderingfood/orderingfood?sid='+sid);
   }
  },
  closeRoom: function () {
    this.setData({
      isShow: false
    })
  },
  notice: function (str) {
    wx.showModal({
      title: str,
      content: '',
      success: function (res) {}
    })
  },
  buttonClick: function (event) {
    console.log('11');
    var id = event.currentTarget.dataset.id;
    var sid = event.currentTarget.dataset.sid;
    var oid = event.currentTarget.dataset.oid;
    var uniacid = this.data.uniacid
    var openid = wx.getStorageSync('openid');
    var that = this;
    if (sid == 'pay') {
      var item = this.data.list[id];
      //先检查房间数量
      var test = Date.now().toString();
      var ordersn = oid + test.substr(-4) + 'sh';
      //由于二次支付，退款时需要一个新的订单号，这里先提交数据库更改订单号
      app.util.request({
        url: 'entry/wxapp/UpDataOrder',
        data: {
          m: 'fy_jiu',
          uniacid: uniacid,
          openid: openid,
          ordersn: ordersn,
          oid: oid
        },
        cachetime: 0,
        success: function (res) {
          if (!res.data.errno) {
            var url = app.siteInfo.siteroot;
            url = url.split('/app')[0];
            var url1 = url;
            url = url + '/addons/fy_jiu/pay' + uniacid + '/example/jsapi.php';
            var notifyUrl = url1 + '/addons/fy_jiu/pay' + uniacid + '/example/test.php';
            wx.request({
              url: url,
              data: {
                openid: openid,
                price: item.actualtotal,
                ordersn: ordersn,
                notifyUrl: notifyUrl,
                roomname: '请到商城订单里查看'
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                var data = res.data;
                if ((data instanceof Object) == false) {
                  that.notice('微信支付失败!');
                  return false;
                }
                var pack = data.package.split('=')[1];
                wx.requestPayment({
                  'timeStamp': data.timeStamp,
                  'nonceStr': data.nonceStr,
                  'package': data.package,
                  'signType': 'MD5',
                  'paySign': data.paySign,
                  'success': function (res) {
                    that.sendMessage(pack, openid, ordersn, oid);
                  },
                  'fail': function (res) {}
                })
              },
              fail: function (res) {
                that.notice('微信支付失败！');
              }
            })
          }
        }
      });

    }

    //取消该订单
    if (sid == 'cancel') {
      wx.showModal({
        title: '确认要取消订单么？',
        content: '',
        success: function (res) {
          if (!res.confirm) {
            return false;
          }
          var uniacid = that.data.uniacid
          app.util.request({
            url: 'entry/wxapp/ShopOrderStatus',
            data: {
              m: 'fy_jiu',
              uniacid: uniacid,
              openid: openid,
              status: 4,
              oid: oid
            },
            cachetime: 0,
            success: function (res) {
              if (!res.data.errno) {
                that.loadData(10);
              }
            }
          });
        }
      })
    }

    //确认收货
    if (sid == 'shouhuo') {
      app.util.request({
        url: 'entry/wxapp/ShopOrderStatus',
        data: {
          m: 'fy_jiu',
          uniacid: uniacid,
          openid: openid,
          status: 3,
          oid: oid
        },
        cachetime: 0,
        success: function (res) {
          if (!res.data.errno) {
            that.loadData(10);
          }
        }
      });
    }



  },


  sendMessage: function (pack, openid, ordersn, oid) {
    var uniacid = app.siteInfo.uniacid;
    var siteTitle = wx.getStorageSync('siteTitle');
    var address = wx.getStorageSync('address');
    var that = this;
    //初始化导航数据
    app.util.request({
      url: 'entry/wxapp/SendMessage',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        'pack': pack,
        'openid': openid,
        'ordersn': ordersn,
        'sitetitle': siteTitle,
        'address': address,
        'secondpay': '1',
        'oid': oid,
        'again': '1'
      },

      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 1000
          })
          that.loadData(10);
        } else {

        }
      }
    });
  },
  navComment: function (event) {
    var oid = event.currentTarget.dataset.oid;
    wx.navigateTo({
      url: '../comment/comment?oid=' + oid,
    })
  },




  getTabbar: function () {
    var that = this;
    app.util.request({
      url: 'entry/wxapp/tabbar',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          var blist = wx.getStorageSync('barlist');
          if (blist == '' || blist.uptime != res.data.data.uptime) {
            wx.setStorageSync('barlist', res.data.data)
          }
          that.setTabBar()
        }
      }
    });
  },
  setTabBar: function () {
    var blist = wx.getStorageSync('barlist');
    var that = this;
    if (!blist) {
      return false;
    }
    //兼容iphonex系列底部
    let isPhone = app.globalData.isIphoneX;
    if (isPhone) {
      this.setData({
        bottomHeight: "138rpx",
      })
    }
    blist['bottomHeight'] = this.data.bottomHeight;
    this.setData({
      blist: blist,
      tcolor: blist.tcolor
    })
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: blist.tcolor
    });
    var pages = getCurrentPages()
    var currentPage = pages[pages.length - 1]
    var url = currentPage.route
    var blist = this.data.blist;
    var pageArr = url.split('/');
    if (pageArr[pageArr.length - 1] == 'man') {
      blist['isCurrentPage'] = true;
    }
    var barArr = new Array(blist.m1_path, blist.m2_path, blist.m3_path, blist.m4_path);
    var currentNum = 0;
    for (var x in barArr) {
      if (barArr[x] == 'man') {
        currentNum = parseInt(x) + 1;
      }
    }
    blist['currentNum'] = currentNum;
    this.setData({
      blist: blist
    })
  },
  tabNav: function (event) {
    var url = event.currentTarget.dataset.url;
    if (url.indexOf('https') != '-1') {
      wx.setStorageSync('navurl', url)
      wx.navigateTo({
        url: '../webview/webview',
      })
    } else {
      wx.navigateTo({
        url: url,
      })
    }
  },


})