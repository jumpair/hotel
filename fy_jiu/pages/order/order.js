var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomNumsList: ['0'],
    roomIndex: 1,
    comeTimeList: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00', '次日01:00', '次日02:00'],
    list: [],
    start: '',
    end: '',
    diffDay: 0,
    roomNums: 1,
    username: [],
    comeTime: '12:00',
    total: 0,
    n1v: '',
    n2v: '',
    n3v: '',
    n4v: '',
    n5v: '',
    n6v: '',
    n7v: '',
    n8v: '',
    n9v: '',
    n10v: '',
    phone: '',
    deposit: 0,
    mprice: 0,
    isshow: false,
    reminder: '',
    roomInfo: {},
    depositTotal: 0,
    everyRoomPrice: 0,
    coupon: [],
    useCouponTotal: 0,
    arrival: 0,
    is_arrival: 0,
    levelName: '',
    sale: 0,
    start_int: 0,
    balance: 0,
    show_balance: 1,
    check_balance: 0,
    exchange: 0,
    score: 0,
    scoretotal: 0, //需要多少积分换房
    getUserNickname: false,
    show_card: 0, //显示身份证
    show_passport: 0, //显示护照号,
    card: '', //身份证号
    passport: '', //护照号
    bottomHeight: '70rpx',
    isShow2: false,
    templateMessageSwitch: false, //判断用户订阅消息开关
    templet_id1:'',//模板消息id,
    templet_id2:'',//模板消息id,
    sid:0,//门店id
    desc:'',//温馨提示
    enter_desc:'',//入住政策
    personinfo:[
      {
        username:'',
        card:'',
        passport:'',
        phone:''
      }
    ]
  },


  onLoad: function (options) {
    
    //this.loadData();
    //重新结构
    this.setData({
      start: options.start,
      end: options.end,
      diffDay: options.diffDay,
      sid:options.sid,
      mxstarttime:options.start.slice(5),
      mxendtime:options.end.slice(5),
      rid:options.rid
    })
    this.getContent();
    app.util.handleTabbar('index');
  },
  getContent:function(){
    let item=this.data;
    let para={
      rid:item.rid,
      sid:item.sid,
      start:item.start,
      end:item.end,
      diffDay:item.diffDay
    }

    app.util.get('entry/wxapp/beforeOrder',para).then(res => {
      var personinfo = item.personinfo;
      personinfo[0].username = res.data.userData.username;
      personinfo[0].card = res.data.userData.cardnum;
      personinfo[0].passport = res.data.userData.username;
      personinfo[0].phone = res.data.userData.phone;
      console.log(res)
      this.setData({
        levelName: res.data.levelData.levelname,
        sale: res.data.levelData.sale,
        balance:res.data.balance,
        phone: res.data.phone,
        card:res.data.card,
        score: res.data.score,
        scoretotal: res.data.scoretotal,
        getUserNickname: res.data.getUserNickname,
        show_card: res.data.show_card,
        show_passport: res.data.show_passport,
        templet_id1:res.data.templet_id1,
        templet_id2:res.data.templet_id2,
        n1v:res.data.username,
        list:res.data.roomlist,
        pricelist:res.data.pricelist,
        reminder:res.data.reminder,
        is_arrival:res.data.is_arrival,
        desc:res.data.desc,
        enter_desc:res.data.enter_desc,
        deposit:res.data.deposit,
        depositTotal:res.data.deposit,
        roomInfo:res.data.pricelist,
        hotelname:res.data.title,
        personinfo,
        fuserprice:res.data.fuserprice,
        otherprice:res.data.otherprice,
        isquota:res.data.isquota
      })

      wx.setNavigationBarTitle({
        title: res.data.title
      })
      var total = this.calc();
      this.setData({
        total: total,
      })

    })  
  },
  loadData: function () {
    var list = this.data.list;
    var roomInfo = this.data.pricelist;

    this.setData({
      list: list,
      deposit: parseFloat(list.deposit),
      mprice: parseFloat(list.mprice),
      reminder: this.data.reminder,
      roomInfo: roomInfo,
      depositTotal: parseFloat(list.deposit),
      everyRoomPrice: parseFloat(list.mprice),
    })

    var total = this.calc();
    this.setData({
      total: total,
    })
  },
 
  comeTimeChange: function (e) {
    this.setData({
      comeTime: this.data.comeTimeList[e.detail.value]
    })
  },
  navCoupon: function () {
    var total = this.data.total - this.data.depositTotal
    wx.navigateTo({
      url: 'ordercoupon/ordercoupon' + '?total=' + total,
    })
  },
  
  bindRoomChange: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    var roomNums = this.data.roomNums;
    if(type == "jian"){
      roomNums>1?roomNums--:roomNums
      
    }else if(type == "jia"){
      roomNums++
    }
    
    //当订房数改变时，先检查房间数量
    var uniacid = app.siteInfo.uniacid;
    app.util.request({
      url: 'entry/wxapp/CheckRoomNums1',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        start: this.data.start,
        end: this.data.end,
        rid: this.data.list.id,
        openid:wx.getStorageSync('openid'),
        uniacid:app.siteInfo.uniacid,
        roomnums: roomNums
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        if (!res.data.errno) {
          var personinfo = that.data.personinfo;
          var len = personinfo.length;
          if(len > roomNums){
            personinfo.pop()
          }else if(len < roomNums){
            personinfo.push({
              username:'',
              card:'',
              passport:'',
              phone:''
            })
          }else{

          }
          console.log(roomNums);
          that.setData({
            roomNums: roomNums,
            coupon:[],
            personinfo
          })
          var depositTotal = parseFloat(that.data.list.deposit) * that.data.roomNums
          var total = that.calc();
          var everyRoomPrice = parseFloat(that.data.list.mprice) * that.data.roomNums
          that.setData({
            total: total,
            depositTotal: depositTotal,
            everyRoomPrice: everyRoomPrice,
           
          })
        } else {
          that.notice(res.data.message);
        }
      }
    });



  },
  notice: function (str) {
    wx.showModal({
      title: str,
      content: '',
      success: function (res) {}
    })
  },
  calc: function () {
    var mprice = parseFloat(this.data.list.mprice);//会员价
    var roomNums = parseInt(this.data.roomNums);//房间数量
    var diffDay = parseInt(this.data.diffDay);//入住天数
    var deposit = parseFloat(this.data.list.deposit);//押金
    var roomInfo = this.data.pricelist;//房间信息
    var fuserprice = parseFloat(this.data.fuserprice);//划线价格
    var isquota = this.data.isquota;
    var total = 0;
    
    // total = this.data.mprice + (this.data.personinfo.length-1)*this.data.otherprice
    console.log(roomNums);
    if(fuserprice == 0 && roomNums == 1 && isquota == 1){
      total += parseFloat(fuserprice) * roomNums
    }else{
      if(fuserprice == 0 && isquota == 1){
        roomNums = roomNums-1;
      }
      console.log(roomInfo)
      for (var i = 0; i < roomInfo.length; i++) {
        total += parseFloat(roomInfo[i]['mprice']) * roomNums
      }
     
    }

    if (this.data.sale != '0.0') {
      var sale = parseFloat(this.data.sale) * 0.1;
      total = total * sale
    }
    
    total += (roomNums * deposit);
    if (this.data.start_int == '1') {
      var num = 0;
    } else {
      var num = 2;
    }
    console.log(total)
    total = total.toFixed(num);
    console.log(total);
    return total;
  }, 
  updateUserInfo: function () {
    var that = this;
    wx.getUserProfile({
      desc: '用于给您更好的订房体验',
      success: function (res) {
        var userInfo = res.userInfo
        wx.setStorageSync('userinfo', userInfo);
        that.setData({
          userinfo: res.userInfo
        })
        var openid = wx.getStorageSync('openid');
        var uniacid = app.siteInfo.uniacid;
        app.util.request({
          url: 'entry/wxapp/GetUserInfo',
          data: {
            m: 'fy_jiu',
            nickname: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.getder,
            city: userInfo.city,
            province: userInfo.province,
            country: userInfo.country,
            openid: openid,
            uniacid: uniacid
          },
          cachetime: 0,
          success: function (res) {
            that.submitOrder();
          }
        });
      },
      fail: function () {
        that.submitOrder();
      }
    })
  },
  submitOrder: function () {
    var item = this.data;
    var istrue = true;
    var nums = this.data.roomNums;

    var personinfo = item.personinfo;
    //名字
    var username = this.isFull("username");
    if (username == '0') {
      this.notice('客户姓名必须全部填写');
      return false;
    }
 

    //验证身份证
    if (item.show_card == 1) {
      var card = this.isFull('card');
      if(card == '0'){
        this.notice('客户身份证必须全部填写');
        return false;
      }
      for(var i = 0; i < personinfo.length; i++){
        if(!this.checkIDCard(personinfo[i].card)){
          i++
          this.notice('入住人'+i+'的身份证号码格式错误');
          return false;
        }
      }
    
    }

    // if (item.show_passport == 1) {
      
    //   if (this.data.passport == '') {
    //     this.notice('请填写护照号码');
    //     return false;
    //   }
    // }


    if (!this.data.diffDay) {
      this.notice('预订时间不对！');
      return false;
    }
    var uniacid = app.siteInfo.uniacid;
    var that = this;
    var openid = wx.getStorageSync('openid');
    var total = item.total;
    var cid;
    
    //判断是否为优惠订单
    if(this.data.fuserprice == 0){
      var discount = 1;
    }else{
      var discount = 0;
    };
   
    item.coupon.id === undefined ? cid = '0' : cid = item.coupon.id
    // console.log(item.end);return;
    app.util.request({
      url: 'entry/wxapp/addOrder',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        rid: item.list.id,
        roomname: item.list.name,
        username: that.isFull('username'),
        phone: that.data.phone,
        cometime: item.comeTime,
        deposit: item.list.deposit,
        roomnum: item.roomNums,
        mprice: item.mprice,
        diffday: item.diffDay,
        starttime: item.start,
        endtime: item.end,
        openid: openid,
        breakfast: item.list.breakfast,
        total: total,
        cid: cid,
        couponmoney: item.useCouponTotal,
        arrival: item.arrival,
        exchange: item.exchange,
        score: item.list.score,
        sale: item.sale,
        check_balance: item.check_balance,
        card: that.isFull('card'),
        passport: item.passport,
        sid:item.sid,
        discount:discount
      },
      cachetime: 0,
      success: function (res) {

        if (res.data == '999') {
          wx.showModal({
            title: '该优惠券已经使用，请到会员中心我的订单里支付。再次下单将会按原价支付',
            content: '',
            success: function (res) {
              that.loadData();
              that.setData({
                cid: '0',
                coupon: {}
              })
              that.submitOrder();
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
        }

        if (!res.data.errno) {
          //判断是否到店付款
          if (res.data.data.arrival != '0') {
            wx.showModal({
              title: '预订成功',
              content: '预订成功',
              success: function (res) {
                wx.navigateTo({
                  url: '../man/man',
                })
              }
            })
          } else if (res.data.data.check_balance == '1') {
            var pages = getCurrentPages();
            var prepages = pages[pages.length - 2];
            prepages.setData({
              balance: res.data.data.balance
            })
            that.setData({
              balance: res.data.data.balance
            })
            wx.showModal({
              title: '支付成功',
              content: '支付成功',
              success: function (res) {
                wx.navigateTo({
                  url: '../man/man',
                })
              }
            })
          } else if (res.data.data.exchange == '1') {
            wx.showModal({
              title: '提示',
              content: '兑换成功',
              success: function (res) {
                wx.navigateTo({
                  url: '../man/man',
                })
              }
            })
          } else {
            // console.log(item.total);return;
            if(item.total == '0.00'){
              wx.showModal({
                title: '预定成功',
                content: '预定成功',
                success: function (res) {
                  wx.navigateTo({
                    url: '../man/man?sid=10',
                  })
                }
              })
            }else{
            var ordersn = res.data.data.ordersn;
            var openid = wx.getStorageSync('openid');
            var url = app.siteInfo.siteroot;
            console.log(url);
            url = url.split('/app/')[0];
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
                roomname: '房间名称：' + item.list.name + ' 房间数量：' + item.roomNums,
                ordersn: ordersn,
                notifyUrl: notifyUrl
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                console.log(res);
                if (res.data.payerrno == '2') {
                  that.notice(res.data.message);
                  return false;
                }
                var data = res.data;
                var pack = data.package.split('=')[1];
                wx.requestPayment({
                  'timeStamp': data.timeStamp,
                  'nonceStr': data.nonceStr,
                  'package': data.package,
                  'signType': data.signType,
                  'paySign': data.paySign,
                  'success': function (res) {
                    console.log(res);
                    wx.setStorageSync('ordersn', ordersn);
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
                        if(that.data.templet_id1=='' && that.data.templet_id2==''){
                          wx.navigateTo({
                            url: '../man/man?sid=0',
                          })
                        }else{
                          that.checkSub();
                        }
                      },
                    
                    });
                  
                  },
                  fail: function(err) {
                    wx.navigateTo({
                      url: '../man/man?sid=0',
                    })
                  }
                })
              }
            })             
          }
          }

        }
      }
    });
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
    let templet_id=this.data.templet_id;
    wx.requestSubscribeMessage({
      tmplIds: [that.data.templet_id1,that.data.templet_id2],
      success(res) {
        that.sendMessage();
      },
      fail(res) {
        wx.navigateTo({
          url: '../man/man?sid=10',
        })
      }
    })
  },

  sendMessage: function () {
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
          wx.redirectTo({
            url: '../man/man?sid=10',
          })
        }
      }
    });
  },
  isFull: function (nums) {
    var personinfo = this.data.personinfo;
    var str = '';
    for (var i = 0; i < personinfo.length; i++) {
      if (personinfo[i][nums] == '') {
        return '0';
      } else {
        str = str + personinfo[i][nums]+ ',';
      }
    }
    return str;
  },
  phoneChange: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
 
  passportChange: function (e) {
    this.setData({
      passport: e.detail.value
    })
  },
  checkPhone: function (phone) {
    if (phone.length == 0) {
      return '请输入手机号码！';
    }
    if (phone.length != 11) {
      return '请输入有效的手机号码！'
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(14[0-9]{1})|(19[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(phone)) {
      return '请输入有效的手机号码！'
    }
    return '1'
  },
  navCoupon: function () {
    var total = this.data.total - this.data.depositTotal
    wx.navigateTo({
      url: 'ordercoupon/ordercoupon' + '?total=' + total+'&rid='+this.data.list.id,
    })
  },
  arrival: function (e) {
    var arrival = 0;
    if (e.detail.value) {
      arrival = 1;
    }
    this.setData({
      arrival: arrival,
      check_balance: 0,
      exchange: 0
    })
  },
  //余额支付转换函数
  balanceChange: function (e) {
    if (e.detail.value) {
      check_balance = 1;
      this.setData({
        check_balance: check_balance,
        arrival: 0,
        exchange: 0,
      })
    } else {
      check_balance = 0;
      this.setData({
        check_balance: check_balance,
      })

    }
    var balance = parseFloat(this.data.balance);
    var check_balance = this.data.check_balance;
    console.log(check_balance);
    if (check_balance) {
      var total = parseFloat(this.data.total);
      if (balance < total) {
        this.notice('余额不足，请先充值或者使用在线支付');
        this.setData({
          check_balance: 0
        })
      }
    }

  },
  //积分兑换转换函数
  exchangeScoreAction: function (e) {
    var score = parseInt(this.data.score); //用户积分数
    var scoretotal = parseInt(this.data.scoretotal); //商品兑换需要用到的积分数
    if (e.detail.value) {
      if (scoretotal > score) {
        this.notice('积分不够，请用其他支付方式');
        this.setData({
          exchange: 0
        })
        return false;
      } else {
        this.setData({
          exchange: 1,
          check_balance: 0,
        })
      }
    } else {
      this.setData({
        exchange: 0,
      })
    }
  },
  usernameChange: function (e) {
    let index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    let personinfo = this.data.personinfo;

    personinfo[index].username = value;

    this.setData({
      personinfo
    })
  },
  cardChange: function (e) {
    let index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    let personinfo = this.data.personinfo;
    personinfo[index].card = value;
    this.setData({
      personinfo
    })
  },
  closeRoom: function () {
    this.setData({
      isshow: false
    })
  },
  checkPrice: function (event) {
    this.setData({
      isshow: true
    })
  },
  closeRoom2: function () {
    this.setData({
      isShow2: false
    })
  },
  openMessage: function (event) {
    this.setData({
      isShow2: true
    })
  },

  checkIDCard: function (idcode) {
    // 加权因子
    var weight_factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验码
    var check_code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

    var code = idcode + "";
    var last = idcode[17]; //最后一个

    var seventeen = code.substring(0, 17);

    // ISO 7064:1983.MOD 11-2
    // 判断最后一位校验码是否正确
    var arr = seventeen.split("");
    var len = arr.length;
    var num = 0;
    for (var i = 0; i < len; i++) {
      num = num + arr[i] * weight_factor[i];
    }

    // 获取余数
    var resisue = num % 11;
    var last_no = check_code[resisue];

    // 格式的正则
    // 正则思路
    /*
    第一位不可能是0
    第二位到第六位可以是0-9
    第七位到第十位是年份，所以七八位为19或者20
    十一位和十二位是月份，这两位是01-12之间的数值
    十三位和十四位是日期，是从01-31之间的数值
    十五，十六，十七都是数字0-9
    十八位可能是数字0-9，也可能是X
    */
    var idcard_patter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;

    // 判断格式是否正确
    var format = idcard_patter.test(idcode);

    // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
    return last === last_no && format ? true : false;
  },
  checkPassport: function (code) {
    var tip = "OK";
    var pass = true;

    if (!code || !/^((1[45]\d{7})|(G\d{8})|(P\d{7})|(S\d{7,8}))?$/.test(code)) {

      pass = false;
    }
    return pass;
  },
  getPhoneNumber: function (e) {
    var that = this;
    if (e.detail.iv && e.detail.encryptedData) {

      wx.login({
        success: function (res) {
          if (res.code) {
            console.log(res.code);
            var uniacid = app.siteInfo.uniacid;
            app.util.request({
              url: 'entry/wxapp/GetUid2',
              data: {
                m: 'fy_jiu',
                code: res.code,
                uniacid: uniacid
              },
              cachetime: 0,
              success: function (res) {
                let sessionKey = res.data.data;
                app.util.request({
                  url: 'entry/wxapp/GetPhone',
                  data: {
                    m: 'fy_jiu',
                    uniacid: uniacid,
                    'encryptedData': encodeURIComponent(e.detail.encryptedData),
                    'iv': e.detail.iv,
                    'session_key': sessionKey,
                  },
                  cachetime: 0,
                  success: function (res) {
                    console.log(res);
                    that.setData({
                      phone: res.data.data.phoneNumber
                    })
                  }
                });
              }
            });
          }
        }
      })
    } else {
      console.log('拒绝获取手机号码')
    }
  }

})