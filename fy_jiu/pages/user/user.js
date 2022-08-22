var app = getApp()
import urils from '../../resource/js/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: {},
    backimg: '',
    phone: 0,
    copyphone: 0,
    copyvalue: '',
    hidecopy: '0',
    score: 0,
    isadmin: 0,
    levalName: '',
    showShop: false,
    balance: 0,
    nonickname:0,
    rebate:'',
    hide_retail:1,
    loadOptions:'',
    hide_tabbar:0,
    bottomHeight: '70rpx',
    iconArr:[],
    sale:'',//会员等级折扣
    coupon_total:0,//会员优惠券总数量
    start_recharge:0,//开启余额充值
    start_fenxiao:0,
    getUserNickname: false,
  },

  onLoad: function (options) {
    console.log('show2');
    var scene = options.scene;

    if (scene != '' && scene != undefined) {
    scene=decodeURIComponent(options.scene);
      scene = scene.split('~');
      console.log(scene);
      this.setData({
        'sid':scene[0],
        'enterMode':1
      })
      console.log(scene[1]!='0');
      if(scene[1]!='0'){  //分销
          wx.setStorageSync('pid', scene[1])
          this.setData({
            pid:scene[1]
          })
      }
    }
    this.setData({
      jnInfo:urils.getTopHeight().jnInfo,
      loadOptions:options
    })
    // console.log('show2');
    
    // this.setData({
    //   jnInfo:urils.getTopHeight().jnInfo,
    //   loadOptions:options
    // })
    

  },
  levelfc:function(){
    app.util.request({
      url: 'entry/wxapp/changelevel',
      data: {
        m: 'fy_jiu',
        openid: 'oOXcO0YgW3Avm_g142jzNqvbx2ag',
        uniacid: app.siteInfo.uniacid,
        merOrderId: '32M814384565340',
        ordersn: '2022081858209re',
        pid:'8',
        level:'2'
      },
      cachetime: 0,
      success: function(res) {
        wx.redirectTo({
          url: '../user',
        })
      }
    });
  },

  onShow: function() {
    
    var that = this;
    app.util.handleTabbar('user');
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        that.loadData();
      })
    } else {
      this.loadData();
    }



  },
  navBack(){
    wx.navigateBack({
      delta: 0,
    })
  },
  loadData: function() {
 
    var that = this
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/User',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid
      },
      cachetime: 0,
      success: function(res) {
        console.log(res);
        if (!res.data.errno) {
          that.setData({
            backimg: res.data.data.backimg,
            phone: res.data.data.phone,
            copyphone: res.data.data.copyphone,
            copyvalue: res.data.data.copyvalue,
            hidecopy: res.data.data.hidecopy,
            score: res.data.data.score,
            isadmin: res.data.data.isadmin,
            levelName: res.data.data.levelname,
            userinfo: res.data.data.userinfo,
            showShop: res.data.data.showShop,
            balance: res.data.data.balance,
            rebate:res.data.data.rebate,
            hide_retail:res.data.data.hide_retail,
            iconArr:res.data.data.icon,
            sale:res.data.data.sale,
            coupon_total:res.data.data.coupon_total,
            start_recharge:res.data.data.start_recharge,
            start_fenxiao:res.data.data.start_fenxiao,
            start_discount:res.data.data.start_discount,
            start_settlein:res.data.data.start_settlein,
            getUserNickname: res.data.data.getUserNickname,
            userlevel:res.data.data.userlevel
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // this.setData({
    //   userinfo: wx.getStorageSync('userinfo')
    // })
  },
  updateUserInfo: function() {
    var that = this;
    wx.getUserProfile({
      desc: '用于给您更好的订房体验',
      success: function(res) {
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
          success: function(res) {
            that.setData({
              'getUserNickname':0
            })
            wx.showToast({
              title: '登录成功！',
            })
          }
        });
      }
    })
  },
  calling: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone
    })
  },
  copyCalling: function() {
    if (this.data.copyphone) {
      wx.makePhoneCall({
        phoneNumber: this.data.copyphone,
        success: function() {
          console.log("拨打电话成功！")
        },
        fail: function() {
          console.log("拨打电话失败！")
        }
      })
    }

  },
  checkmember(){
    wx.navigateTo({
      url: './usermember/usermember',
    })
  },
  navShopOrder: function() {
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../shopman/shopman',
      })
    }
  },
  coupon: function() {
    wx.navigateTo({
      url: '../coupon/coupon',
    })
  },
  mycoupon: function() {
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../mycoupon/mycoupon',
      })
    }
  },
  man: function(e) {
    if(this.checkGetUser()){
      let sid = e.currentTarget.dataset.sid
      wx.navigateTo({
        url: '../man/man?sid='+sid,
      })
    }
  },
  myscore: function() {
    if(this.checkGetUser()){
      wx.navigateTo({
        url: 'myscore/myscore',
      })
    }
  
  },
  navAdmin: function() {
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../admin/index',
      })
    }
  },
  navUserinfo: function() {
    // console.log(this.data.getUserNickname);return;
    if(this.checkGetUser()){
      wx.navigateTo({
        url: 'userinfo/userinfo?getUserNickname='+this.data.getUserNickname+'&userinfo='+this.data.userinfo+'&levelName='+this.data.levelName,
      })
    }
  },
  upgrade:function(){
      var that = this;
      var openid = wx.getStorageSync('openid');
      var uniacid = app.siteInfo.uniacid;
      app.util.request({
        url: 'entry/wxapp/userlevel',
        data: {
          m: 'fy_jiu',
          openid: openid,
          uniacid: uniacid,
        },
        cachetime: 0,
        success: function(res) {
          console.log(res);
          that.setData({
            gid:res.data.data.gid,
            chargeMoney:res.data.data.levelcost,
            level:res.data.data.level
          })
          // that.handlePay('',res.data.data.levelcost);
          that.handlePay('',res.data.data.levelcost);
        }
      });
  },
  //处理付款信息
  handlePay: function (gid, chargeMoney){

    var that=this;
    var uniacid = app.siteInfo.uniacid;
    app.util.request({
      url: 'entry/wxapp/Recharge',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        gid: gid,
        money: chargeMoney,
        op: 'recharge',
        openid: wx.getStorageSync('openid')
      },
      cachetime: 0,
      success: function (res) {
        console.log(res);
        if (!res.data.errno) {
          that.paying(res.data.data.oid,chargeMoney,uniacid);
        }
      }
    });
  },
  paying: function (oid, money, uniacid){
    var that=this;
    var url = app.siteInfo.siteroot;
    url = url.split('/app/')[0];
    var url1 = url;
    url = url + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/chinaums.php';
    var notifyUrl = url1 + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/chinaumsnotify.php';
    // url = url + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/jsapi.php';
    // var notifyUrl = url1 + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/test.php';
    wx.request({
      url: url,
      data: {
        openid: wx.getStorageSync('openid'),
        price: money,
        ordersn: oid,
        notifyUrl: notifyUrl,
        roomname: '会员升级'
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res);
        var data = res.data;
        var pack = data.package.split('=')[1];
        
        wx.requestPayment({
          'timeStamp': data.timeStamp,
          'nonceStr': data.nonceStr,
          'package': data.package,
          'signType': data.signType,
          'paySign': data.paySign,
          'success': function (pres) {
            // console.log(pres);return
            app.util.request({
              url: 'entry/wxapp/changelevel',
              data: {
                m: 'fy_jiu',
                openid: wx.getStorageSync('openid'),
                uniacid: app.siteInfo.uniacid,
                merOrderId: data.merOrderId,
                ordersn: oid,
                pid:that.data.pid,
                level:that.data.level
              },
              cachetime: 0,
              success: function(res) {
                wx.redirectTo({
                  url: '../user',
                })
              }
            });

          },
        })
      }
    })
  
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
  navRecharge: function() {
    if(this.checkGetUser()){
      wx.navigateTo({
        url: 'recharge/recharge',
      })
    }
  
  },
  myCashRecords: function() {
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../cashrecords/cashrecords',
      })
    }
  },
  rebateOnTap:function(){
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../records/records',
      })
    }
  
  },
  aboutUs:function(){
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../aboutus/aboutus',
      })
    }
  
  },

  CashApply:function(){
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../cashapply/cashapply',
      })
    }
  
  },
  navSettlein:function(){
    if(this.checkGetUser()){
      wx.navigateTo({
        url: '../settlein/settlein',
      })
    }
  },

  //检查是否已经授权获取昵称和头像
  checkGetUser:function(){
      if(this.data.getUserNickname){
         app.util.mes('请先登录，再进行下面操作哦！');
         return false;
      }else{
        return true;
      }
  },
  
  onShareAppMessage: function() {

  },


  getTabbar: function() {
    var that = this;
    app.util.request({
      url: 'entry/wxapp/tabbar',
      data: {
        m: 'yyf_hotel',
        uniacid: app.siteInfo.uniacid
      },
      cachetime: 0,
      success: function(res) {
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
  setTabBar: function() {
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
    // wx.setNavigationBarTitle({
    //   title: blist.name
    // })
    var pages = getCurrentPages()
    var currentPage = pages[pages.length - 1]
    var url = currentPage.route
    var blist = this.data.blist;
    var pageArr = url.split('/');
    if (pageArr[pageArr.length - 1] == 'user') {
      blist['isCurrentPage'] = true;
    }
    var barArr = new Array(blist.m1_path, blist.m2_path, blist.m3_path, blist.m4_path);
    var currentNum = 0;
    for (var x in barArr) {
      if (barArr[x] == 'user') {
        currentNum = parseInt(x) + 1;
      }
    }
    blist['currentNum'] = currentNum;
    this.setData({
      blist: blist
    })
  },
  //处理版权点击动作
  copy_action:function(){
    app.util.handelCopyAction();
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


  /***********************生成推广码**********************/
  creatCode: function (event) {
    var that = this;
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');


    if (!openid) {
      console.info('lyj openid is null');
      return false;
    }


    app.util.request({
      url: 'entry/wxapp/personposter',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        if (!res.data.errno) {
          that.setData({
            isShow: true,
            orderCode: res.data.data
          })
        } else {
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
      success: function (res) { }
    })
  },
  //保存图片方法
  saveImgAction: function () {
    var that = this;
    wx.getImageInfo({
      src: this.data.orderCode,
      success: function (sres) {
        wx.saveImageToPhotosAlbum({
          filePath: sres.path,
          success: function (fres) {
            that.notice('保存成功');
            that.setData({
              isShow: false
            })
          }
        })
      },
      fail: function (sres) {
        that.notice('保存失败，请检查小程序官方后台配置');
      }

    })
  },
  /***********************生成推广码**********************/

  /***********************我的下级**********************/
  lowerTap: function () {
    wx.navigateTo({
      url: '../lower/lower',
    })
  },
  /***********************我的下级**********************/


  /***********************绑定fuid*************************** */
  // 配置pid
  setpid: function () {
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    // 
    var pid = this.data.pid;
    console.info('lyj pid', this.data.pid);
    if (pid != '' && pid != undefined) {
      console.log('存在父节点pid');
    }


    var that = this;
    // 获取用户openid
    // debugger;
    app.util.request({
      url: 'entry/wxapp/SetPid',
      data: {
        m: 'yyf_hotel',
        openid: openid,
        uniacid: uniacid,
        pid: pid,
      },
      cachetime: 0,
      success: function (res) {
        console.info(res);
        if (!res.data.errno) {

        }
      }
    });
  },
  /***********************绑定fuid*************************** */

})