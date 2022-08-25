var app = getApp()
Page({
  data: {
    list:{},
    currentTabsIndex: 10,
    currentCatId: 0,
    uniacid:0,
    orderCode:'',
    isShow:false,
    close_refund: 0,
    bottomHeight: '70rpx',
    isShow2: false,
    templateMessageSwitch: false, //判断用户订阅消息开关
    templet_id1:'',//模板消息id,
    templet_id2:'',//模板消息id,
   
  },
  catClick: function (event) {
    var sid = event.currentTarget.dataset.sid;
    this.setData({
      currentTabsIndex: sid
    })
    if (sid == '6') { sid = '3,4,6' }
    this.loadData(sid);
  },
  onLoad: function (options) {
    app.util.handleTabbar('man');
    let currentTabsIndex = options.sid
    var uniacid = app.siteInfo.uniacid;
    this.setData({
      uniacid: uniacid,
      currentTabsIndex
    })

    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        this.loadData(currentTabsIndex);
      })
    } else {
      this.loadData(currentTabsIndex);
    }
  },
  loadData: function(status){
    app.util.get('entry/wxapp/man', {  'status':status }).then(res => {
      console.log(res);
        this.setData({
          'close_refund':res.data.close_refund,
          'list':res.data.list,
          'templet_id1':res.data.templet_id1,
          'templet_id2':res.data.templet_id2
        })
    })


  },
  creatCode: function (event) {
    var id = event.currentTarget.dataset.oid;
    var that = this;
    var uniacid = that.data.uniacid
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/CreatCode',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
        oid: id
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            isShow:true,
            orderCode:res.data.data.imgUrl
          })
        }else{
          that.notice(res.data.message);
        }
      }
    });

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
      success: function (res) {
      }
    })
  }, 
  buttonClick: function(event){
    var id = event.currentTarget.dataset.id;
    var sid = event.currentTarget.dataset.sid;
    var oid = event.currentTarget.dataset.oid;
    var uniacid = this.data.uniacid
    var openid = wx.getStorageSync('openid');
    var that = this;
    if (sid =='pay'){
        var item = this.data.list[id];
        //先检查房间数量
        app.util.request({
          url: 'entry/wxapp/CheckRoomNums',
          data: {
            m: 'fy_jiu',
            rid: item.rid,
            oid:item.oid
          },
          cachetime: 0,
          success: function (res) {
            if (!res.data.errno) {
              var test = Date.now().toString();
              var ordersn = oid + test.substr(-4);
              //由于二次支付，退款时需要一个新的订单号，这里先提交数据库更改订单号
              app.util.request({
                url: 'entry/wxapp/UpdateOrder',
                data: {
                  m: 'fy_jiu',
                  uniacid: uniacid,
                  openid: openid,
                  ordersn:ordersn,
                  oid:oid
                },
                cachetime: 0,
                success: function (res) {
                  if (!res.data.errno) {
                    if(res.data.erron == -1){
                      wx.showToast({
                        title: res.data.message,
                      })
                      return false;
                    }else{

                        var url = app.siteInfo.siteroot;
                        url = url.split('/app')[0];
                        var url1 = url;
                        url = url + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/chinaums.php';
                        var notifyUrl = url1 + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/chinaumsnotify.php';
                        // url = url + '/addons/fy_jiu/pay' + uniacid + '/example/jsapi.php';
                        // var notifyUrl = url1 + '/addons/fy_jiu/pay' + uniacid + '/example/test.php';
                        wx.request({
                          url: url,
                          data: {
                            openid: openid,
                            price: item.total,
                            roomname: '房间名称：' + item.roomname + '    房间数量：' + item.roomnum,
                            ordersn: ordersn,
                            notifyUrl: notifyUrl
                          },
                          header: {
                            'content-type': 'application/json'
                          },
                          success: function (res) {
                            var data = res.data;
                            if ((data instanceof Object) == false) { that.notice('微信支付失败!'); return false; }
                            var pack = data.package.split('=')[1];
                            wx.requestPayment({
                              'timeStamp': data.timeStamp,
                              'nonceStr': data.nonceStr,
                              'package': data.package,
                              'signType': data.signType,
                              'paySign': data.paySign,
                              'success': function (res) {
                                app.util.request({
                                  url: 'entry/wxapp/newpayorder',
                                  data: {
                                    m: 'fy_jiu',
                                    openid: wx.getStorageSync('openid'),
                                    uniacid: app.siteInfo.uniacid,
                                    merOrderId: data.merOrderId,
                                    ordersn:ordersn
                                  },
                                  cachetime: 0,
                                  success: function(res) {
                                    wx.setStorageSync('ordersn', ordersn);
                                    
                                      wx.showToast({
                                        title: '支付成功',
                                        icon: 'success',
                                        duration: 1000
                                      })
                                      that.loadData(that.data.currentTabsIndex);
                                   
                                  }
                                });
                                
                              },
                              'fail': function (res) {
                              }
                            })
                          },
                          fail: function (res) {
                            that.notice('微信支付失败！');
                          }
                        })
                    }
                  }
                }
              });

              
            }else{
              wx.showModal({
                title: res.data.message,
                content: 11,
                success: function (res) {
                }
              })
              return false;  
            }
          }
        });

        
    }

    //退款
    if(sid == 'refund'){
      wx.showModal({
        title: '确认要申请退款么',
        content: '',
        success: function (res) {
          if (!res.confirm) { return false;}
          var uniacid = that.data.uniacid
          app.util.request({
            url: 'entry/wxapp/OrderStatus',
            data: {
              m: 'fy_jiu',
              uniacid: uniacid,
              openid: openid,
              status: '5',
              oid : oid
            },
            cachetime: 0,
            success: function (res) {
              if (!res.data.errno) {
                that.loadData(that.data.currentTabsIndex);
              }
            }
          });
        }
      })
    }

    //取消该订单
    if (sid == 'cancel') {
      wx.showModal({
        title: '确认要取消订单么？',
        content: '',
        success: function (res) {
          if (!res.confirm) { return false; }
          var uniacid = that.data.uniacid
          app.util.request({
            url: 'entry/wxapp/OrderStatus',
            data: {
              m: 'fy_jiu',
              uniacid: uniacid,
              openid: openid,
              status: '4',
              oid: oid
            },
            cachetime: 0,
            success: function (res) {
              if (!res.data.errno) {
                that.loadData(that.data.currentTabsIndex);
              }
            }
          });
        }
      })
    }
  },
  checkSub: function () {
    let that = this;
    wx.getSetting({
      withSubscriptions: true,
      success (res) {
        console.log('checksub success:'+res);
        
        if(res.errMsg){
          that.setData({
            isShow2:true
          })
        }else{
          console.log(res.subscriptionsSetting.itemSettings!=undefined);
          if(res.subscriptionsSetting.itemSettings!=undefined){
            that.getMessage();
          }else{
            that.setData({
              isShow2:true
            })
          }
        }
    
      },fail(res){
        console('fail'+res);
      }
    })

  },

  getMessage: function(){
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: [that.data.templet_id1,that.data.templet_id2],
      success(res) {
        that.sendMessage();
      },
      fail(res) {
        wx.navigateTo({
          url: '../man/man',
        })
      }
    })
  },

  sendMessage: function () {
    var that=this;
    app.util.request({
      url: 'entry/wxapp/SendMessage2',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        'openid': wx.getStorageSync('openid'),
        'ordersn': wx.getStorageSync('ordersn'),
        'sitetitle': wx.getStorageSync('siteTitle'),
        'address': wx.getStorageSync('address'),
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 1000
          })
          that.loadData(that.data.currentTabsIndex);
        }
      }
    });
  },


  navComment: function (event) {
    var oid = event.currentTarget.dataset.oid;
    let hotelName=event.currentTarget.dataset.hotel_name
    let sid=event.currentTarget.dataset.sid
    
    wx.navigateTo({
      url: 'upcomment/upcomment?oid=' + oid+'&hotelname='+hotelName+'&sid='+sid,
    })
  },

  navDetail:function(event){
    let oid=event.currentTarget.dataset.oid;;
    wx.navigateTo({
      url: './man_detail?oid=' + oid,
    })
  },  

  closeRoom2: function () {
    this.setData({
      isShow2: false
    })
  },

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