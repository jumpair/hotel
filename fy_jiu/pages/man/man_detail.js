var app = getApp();
Page({

  data: {
    list: [],
    store: [],
    personlist: [],
    currentTabsIndex: 10,
    leavetime: {
      "minute":"00",
      "sec":"00"
    }
  },

  onLoad: function (options) {
    console.log(options)
    let oid = options.oid;
    // let oid = 54;
    var that = this
    this.setData({
      myoid: oid
    })

    app.util.get('entry/wxapp/manDetail', {
      'oid': oid
    }).then(res => {

      let timespart = res.data.timespart
      console.log(res.data.list)
      that.setData({
        list: res.data.list,
        store: res.data.store,
        personlist: res.data.list.info,
        rid:res.data.list.rid,
        timespart
      })
      if(timespart<0||!timespart){
        return false;
      }
      var countdown = res.data.countdown * 60;
      if(timespart > countdown){
        console.log('大于10分钟')
        that.cancleOrder()
      }else{
        timespart = countdown - timespart
        that.daojishi(timespart)
      }
      
      // name: this.data.store.title,
      wx.setNavigationBarTitle({
        title: res.data.store.title,
      })

    })
    var uniacid = app.siteInfo.uniacid;
    this.setData({
      uniacid: uniacid
    })
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        // this.loadData(this.data.myoid);
      })
    } else {
      // this.loadData(this.data.myoid);
    }
  },
  cancleOrder(){
    let oid = this.data.list.oid
    var that = this
    //取消订单
    var uniacid = that.data.uniacid
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/OrderStatus',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
        status: '4',
        oid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          console.log(that.data.myoid)
          that.loadData(that.data.myoid);
        }
      }
    });
  },
  loadData: function (status) {
    app.util.get('entry/wxapp/manDetail', {
      'oid': status
    }).then(res => {
      console.log(res)
      this.setData({
        list: res.data.list,
        store: res.data.store
      })
      // name: this.data.store.title,
      wx.setNavigationBarTitle({
        title: res.data.store.title,
      })

    })

  },
  //倒计时
  daojishi(num) {
    let data;
    var that = this
    var timer = null;
    
    timer = setInterval(() => {
      num--
      if(num == '-1' || that.data.list.status != 0){
        clearInterval(timer);
      }
      data = that.timer_(num)
      that.setData({
        leavetime:data
      })
    }, 1000)
    
  },
  timer_(second) {
    //返回天、时、分
    if (second > -1) {
      var day = 0;
      var hour = 0;
      var minute = 0;
      var sec = 0;
      var data = {};
      minute = Math.floor(second / (60))
      if (parseInt(minute) > 60) {
        hour = parseInt(minute / 60);
        minute %= 60; //算出有多分钟
      }
      if (parseInt(hour) > 24) {
        day = parseInt(hour / 24);
        hour %= 24; //算出有多分钟
      }
      sec = second%60;
      data.day = day;
      data.hour = hour;
      data.minute = minute<10?('0'+minute):minute;
      data.sec = sec<10?('0'+sec):sec;
      return data;
    }else{
      this.cancleOrder()
    }
  },
  //酒店拨打电话
  call: function () {
    let phone = this.data.store.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  //去酒店地址
  goToAddress: function () {
    let poarr = this.data.store.position.split(',');
    wx.openLocation({
      latitude: Number(poarr[0]),
      longitude: Number(poarr[1]),
      name: this.data.store.title,
      address: this.data.store.address
    })
  },

  // //获取系统信息
  // getSystemInfo() {
  //   wx.getSystemInfo({
  //     success (res) {
  //       console.log('wx.getSystemInfo', res)
  //     }
  //   })
  // },

  buttonClick: function(event){
    var id = event.currentTarget.dataset.id;
    var sid = event.currentTarget.dataset.sid;
    var oid = event.currentTarget.dataset.oid;
    var uniacid = this.data.uniacid
    var openid = wx.getStorageSync('openid');
    var that = this;
    if (sid =='pay'){
        var item = this.data.list;
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
                                      // that.loadData(ordersn);
                                    
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
    if (sid == 'refund') {
      wx.showModal({
        title: '确认要申请退款么',
        content: '',
        success: function (res) {
          if (!res.confirm) {
            return false;
          }
          var uniacid = that.data.uniacid
          app.util.request({
            url: 'entry/wxapp/OrderStatus',
            data: {
              m: 'fy_jiu',
              uniacid: uniacid,
              openid: openid,
              status: '5',
              oid: oid
            },
            cachetime: 0,
            success: function (res) {
              if (!res.data.errno) {
                that.loadData(that.data.myoid);
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
          if (!res.confirm) {
            return false;
          }
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
                that.loadData(that.data.myoid);
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
      success(res) {
        console.log('checksub success:' + res);

        if (res.errMsg) {
          that.setData({
            isShow2: true
          })
        } else {
          console.log(res.subscriptionsSetting.itemSettings != undefined);
          if (res.subscriptionsSetting.itemSettings != undefined) {
            that.getMessage();
          } else {
            that.setData({
              isShow2: true
            })
          }
        }

      },
      fail(res) {
        console('fail' + res);
      }
    })

  },

  getMessage: function () {
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: [that.data.templet_id1, that.data.templet_id2],
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
    var that = this;
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
          that.loadData(that.data.myoid);
        }
      }
    });
  },



  navComment: function (event) {
    var oid = event.currentTarget.dataset.oid;
    //let hotelName=event.currentTarget.dataset.hotel_name
    let sid = event.currentTarget.dataset.sid
    let hotelName = this.data.store.title
    let thumb = this.data.store.thumb
    //console.log(thumb);
    wx.navigateTo({
      // url: 'upcomment/upcomment?oid=' + oid+'&hotelname='+hotelName+'&sid='+sid,
      url: 'upcomment/upcomment?oid=' + oid + '&hotelname=' + hotelName + '&thumb=' + thumb + '&sid=' + sid,
    })
  },

  navDetail: function (event) {
    let oid = event.currentTarget.dataset.oid;;
    wx.navigateTo({
      url: './man_detail?oid=' + oid,
    })
  },

  closeRoom2: function () {
    this.setData({
      isShow2: false
    })
  },
  goback: function () {
    wx.navigateBack({
      delta: -1,
    })
  }


})