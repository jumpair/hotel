var app = getApp();
import urils from '../../resource/js/utils.js'
Page({
  data: {
    slide:[],//幻灯片
    slideTotal:0,//幻灯片数量
    inDate:'',//入住日期 (2020-07-19)
    outDate:'',//离店日期
    inDate2:'',//入住日期(07月19号)
    outDate2:'',//离店日期
    diffDay:1,//入住天数
    sid:0,//酒店id
    list:[],//数据列表
    hotel:[],//酒店相关信息
    showModalStatus: false,
    current:1,//房间详情页幻灯片索引
    scoreList:[1,2,3,4,5],//五角星列表
    score:0,//门店分数
    commentTotal:0,//评论总数
    commentList:[],
    follow:0,
    showModalStatus2: false,//用来处理分享弹窗
    enterMode:0,//进入方式，用来判断客户是从分享进入还是从首页进入。左上角返回图标好处理相关跳转
    pid:0,//分销的上级id,
    uid:0,//分销时，自己的id
    getUserNickname: false,
    start_fenxiao:0,//分销开关
    fenxiao_desc:'',//分销说明
    start_food:0,//开启点餐入口总开关
    start_shop:0,//开启商城入口总开关
    start_discount:0,//优惠券开关
    loadOptions:'',
    start_longterm:0,//长租房开关
    // 房间详情视频和幻灯片切换需要用到的参数
    current1: 1,
    currentTab: 0,
    flag: false,
    show_lineprice:0,//显示划线价格
    show_roomnum:0,//显示剩余房间数量
  },

  onShow:function(){
    var that = this
    console.log(that)
    var options=this.data.loadOptions;
     //判断是从首页带日期过来的还是通过分享过来的
     var scene = options.scene;
     if (scene != '' && scene != undefined) {
      scene=decodeURIComponent(options.scene);
       scene = scene.split('*');
       console.log(scene);
       this.setData({
         'sid':scene[0],
         'enterMode':1
       })
       console.log(scene[1]!='0');
       if(scene[1]!='0'){  //分销
           this.setData({
             pid:scene[1]
           })
       }
     }else{
       if(options.inDate){
         this.setData({
           'inDate':options.inDate,
           'outDate':options.outDate,
           'inDate2':options.inDate2,
           'outDate2':options.outDate2,
           'diffDay':options.diffDay,
           'sid':options.id,
         })
       }else{
         this.setData({
           'sid':options.id,
           'enterMode':1
         })
       }
     }
 
  
     //获取用户身份
     var openid = wx.getStorageSync('openid');
     if (!openid) {
       app.userLogin().then(res => {
             //获取位置，计算出访客距离该店的距离
             var position = wx.getStorageSync('position');
             if (position == '' || !position) {
               app.util.getLocation().then(res=>{
                 this.getContent(res);
               })
             }else{
                 this.getContent(position);
             }
       })
     }else{
          //获取位置，计算出访客距离该店的距离
          var position = wx.getStorageSync('position');
          if (position == '' || !position) {
            app.util.getLocation().then(res=>{
              this.getContent(res);
            })
          }else{
              this.getContent(position);
          }

          
     }

     
     app.util.request({
      url: 'entry/wxapp/getuser',
      data: {
        m: 'fy_jiu',
        openid: wx.getStorageSync('openid'),
        uniacid: app.siteInfo.uniacid,
      },
      cachetime: 0,
      success: function(res) {
        console.log(res)
          that.setData({
            user:res.data.data.user
          })
      }
    });
  },

  onLoad: function (options) {

    this.setData({
      jnInfo:urils.getTopHeight().jnInfo
    })


    var that = this;
    this.setData({
      loadOptions:options
    })
    app.util.request({
      url: 'entry/wxapp/getuser',
      data: {
        m: 'fy_jiu',
        openid: wx.getStorageSync('openid'),
        uniacid: app.siteInfo.uniacid,
      },
      cachetime: 0,
      success: function(res) {
          that.setData({
            show:res.data.data.show,
            user:res.data.data.user
          })
      }
    });
   

    app.util.handleTabbar2(''); 
  },
  clickOrder: function (event){
    
    if(this.data.diffDay>2 && this.data.hotelfree==0 && event.currentTarget.dataset.isquota == 1){
      wx.showModal({
        title:'最多订两晚',
        showCancel: false,

      })
      return false
    }
    

    if (this.dateDiff(this.data.inDate, this.data.outDate) ==0){
      wx.showToast({
        title: '日期不正确',
        icon: 'success',
        duration: 2000
      })
      return false;
    }
  

    var id = parseInt(event.currentTarget.dataset.id);

    var itemroom = this.data.list[id];
    if (itemroom.roomkind == '2') {
      let termdays = itemroom.termdays;
      if (termdays > this.data.diffDay) {
        app.util.mes('该房间最少预订' + termdays + '天');
        return false;
      }
    }  


    var rid = this.data.list[id].id;
    
    // var user = wx.getStorageSync('userInfo');
    // console.log(wx.getStorageSync('userInfo').openid);return;

    if(this.data.show == 1){
     // 判断用户的基本信息介绍
      if(this.data.user.username != '' && this.data.user.phone != '' && this.data.user.cardnum != ''){
        wx.navigateTo({
          url: '../order/order?start=' + this.data.inDate + '&end=' + this.data.outDate + '&diffDay=' + this.data.diffDay+'&rid='+rid+'&sid='+this.data.sid
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '请先完善基本信息',
          success (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../user/userinfo/userinfo'
              });
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }else{
      wx.showModal({
        title: '提示',
        content:'抱歉，只有会员才能下单',
        showCancel: false
      })
    }

    
   
  },
  getContent:function(position){
    //判断跳转过来有没有日期参数
    let para;
    
    if(this.data.inDate){
      para={
        'inDate':this.data.inDate,
        'outDate':this.data.outDate,
        'sid':this.data.sid,
        'position':position
      }
    }else{
      para={
        'position':position,
        'sid':this.data.sid
      };  
    }

    app.util.get('entry/wxapp/hotel',para).then(res => {
      console.log(res)
      this.setData({
        list:res.data.list,
        slide:res.data.slide,
        slideTotal:res.data.slideTotal,
        hotel:res.data.hotel,
        inDateWeek:res.data.inDateWeek,
        outDateWeek:res.data.outDateWeek,
        score:res.data.score,
        commentTotal:res.data.comment_total,
        commentList:res.data.comment_list,
        follow:res.data.follow,
        getUserNickname: res.data.getUserNickname,
        start_fenxiao:res.data.start_fenxiao,
        fenxiao_desc:res.data.fenxiao_desc,
        //pid:res.data.pid,
        start_food:res.data.start_food,
        start_shop:res.data.start_shop,
        start_longterm:res.data.hotel.start_longterm,
        show_lineprice:res.data.hotel.show_lineprice,
        show_roomnum:res.data.hotel.show_roomnum,
        uid:res.data.uid,
        start_discount:res.data.start_discount,
        hotelfree:res.data.hotelfree
        
      })
      //处理好评星星个数
      let starNum=parseInt(res.data.score);
      this.setData({starNum:starNum});
      if(!this.data.inDate){
        //如果是直接进入酒店页面的，通过后台处理日期函数赋值
        console.log('进入了')
        this.setData({
          inDate:res.data.inDate,//入住日期 (2020-07-19)
          outDate:res.data.outDate,//离店日期
          inDate2:res.data.inDate2,//入住日期(07月19号)
          outDate2:res.data.outDate2,//离店日期
          diffDay:this.dateDiff(res.data.inDate,res.data.outDate)
        })
      }

      //如果是需要分销绑定上下级关系
      let pid = this.data.pid;
      if(pid){
        this.setpid(); 
      }

    })
  },

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
        m: 'fy_jiu',
        openid: openid,
        uniacid: uniacid,
        pid: pid,
      },
      cachetime: 0,
      success: function (res) {
       
      }
    });
  },
  dateDiff :function (sDate1, sDate2) { 
    var aDate, oDate1, oDate2, iDays;
    aDate = sDate1.split("-");
    oDate1 = new Date(aDate[1] + '/' + aDate[2] + '/' + aDate[0]);  
    aDate = sDate2.split("-");
    oDate2 = new Date(aDate[1] + '/' + aDate[2] + '/' + aDate[0]);
    if ((oDate1 - oDate2)>=0){
      return 0;
    }else{
      iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
      return iDays; 
    }
  },
  //跳转到餐厅
  navOrderingFood:function(){
    app.util.nav('../orderingfood/orderingfood?sid='+this.data.hotel.id);
  },
  //跳转到优惠券
  navCoupon:function(){
    app.util.nav('../coupon/coupon?sid='+this.data.hotel.id);
  },
  //酒店拨打电话
  call:function(){

    let phone=this.data.hotel.phone;
    let type = false
    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model;
        if (modelmes.search('iPhone') != -1 ) {
          type =  true;
        }
      }
    })
    if(type){
      wx.makePhoneCall({
        phoneNumber: phone,
      })
    }else{
      wx.showModal({
        title:'提示',
        content:'拨打'+phone+'?',
        success(res){
          if (res.confirm) {
            // console.log('用户点击确定')
            wx.makePhoneCall({
              phoneNumber: phone,
            })
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
    }
    
   
  },
  //去酒店地址
  goToAddress:function(){
    let poarr=this.data.hotel.position.split(',');
    wx.openLocation({
      latitude: Number(poarr[0]),
      longitude: Number(poarr[1]),
      name: this.data.hotel.title,
      address: this.data.hotel.address
    })
  },
  //跳转到评论页面
  navComment:function(){
    wx.navigateTo({
      url: '../comment/comment?sid='+this.data.hotel.id,
    })
  },
  //跳转日历
  navCalc:function(){
    app.util.nav('../calendar/index?&checkInDate='+this.data.inDate+'&checkOutDate='+this.data.outDate);
  },
  //显示当前酒店图集
  showImg:function(){
   let _this = this
　　//图片预览
    wx.previewImage({
      current:_this.data.slide[0] , // 当前显示图片的http链接
      urls: _this.data.slide // 需要预览的图片http链接列表
    })
  },
  //放大评论图片
  showCommentImg:function(event){
    let _this = this;
    let src=event.currentTarget.dataset.src;
    let id=event.currentTarget.dataset.id;
    console.log(id);
    let thumb1=this.data.commentList[id].thumb1;
    let thumb2=this.data.commentList[id].thumb2;
    let urls=[thumb1,thumb2];
 　　//图片预览
     wx.previewImage({
       current:src, // 当前显示图片的http链接
       urls:urls
     })
   },
  //返回首页
  navIndex:function(){
    wx.navigateTo({
      url: '../index/index',
    })
  },
  //关注本店
  follow:function(event){
    let id=this.data.hotel.id;
    let op = event.currentTarget.dataset.op;
    console.log(op);
    app.util.get('entry/wxapp/follow', { 'id': id, 'op': op}).then(res => {
      if(op=='add'){
        this.setData({
          follow:1
        })
        app.util.notice('已成功关注');
      }else{
        this.setData({
          follow:0
        })
        app.util.notice('已成功取消关注');
      }
    
    })
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

  powerDrawer: function (event) {
    var id = parseInt(event.currentTarget.dataset.id);
    var currentRoom=this.data.list[id]
    this.setData({
      currentRoom: currentRoom,
      current:1,
      current1: 1,
      currentTab: 0,
      flag: false
    })
    var currentStatu = event.currentTarget.dataset.statu;
    console.log(currentStatu);
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });
    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation;
    // 第3步：执行第一组动画：Y轴偏移240px后(盒子高度是240px)，停
    animation.translateY(240).step();
    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export()
    })
    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(function () {
      // 执行第二组动画：Y轴不偏移，停
      animation.translateY(0).step()
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      })
      //关闭抽屉
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
    // 显示抽屉
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  },
  
  navBack:function(){
    if(this.data.enterMode==1){
       wx.reLaunch({
         url: '../index/index',
       }) 
    }else{
      wx.navigateBack({
        delta: 1
      })
    }
  },
  onShareAppMessage: function () {
    let url;
    if(this.data.start_fenxiao){
        url='/fy_jiu/pages/hotel/hotel?scene='+this.data.hotel.id+'*'+this.data.uid;
    }else{
      url='/fy_jiu/pages/hotel/hotel?id='+this.data.hotel.id;
    }
    console.log(url);
    return {
      title: this.data.hotel.title,
      path: url
    } 
  },
   // 房间详情视频和幻灯片切换处理代码开始
   swiper: function (e) {
    this.setData({
        current: e.detail.current + 1
    })
  },
   swiper1: function (e) {
    this.setData({
        current1: e.detail.current + 1
    })
  },
  clickTab: function (e) {
    
      this.setData({
          currentTab: e.currentTarget.dataset.current
      })
  },
  hide: function() {
      let cr=this.data.currentRoom;
      cr['show_video']='1';
      this.setData({
          flag: true,
          currentRoom:cr
      })
  },
  navVr:function(){
     let url=this.data.currentRoom.vr_src;
     wx.setStorageSync('navurl', url);
     wx.navigateTo({
       url: '../webview/webview',
     })
  },
  // 房间详情视频和幻灯片切换处理代码结束
  //生成海报
  creatBillAction: function () {
    var that = this;
    var uniacid = app.siteInfo.uniacid;
    app.util.request({
      url: 'entry/wxapp/CreatBill',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        sid: that.data.hotel.id,
        openid:wx.getStorageSync('openid')
      },
      cachetime: 0,
      success: function (res) {
        console.log(res);
        if (!res.data.errno) {
          that.setData({
            isShow2: true,
            showModalStatus: false,
            code: res.data.data
          })
        } else {
          that.notice(res.message);
        }
        that.util2('close');
      }
    });
  },
  //保存图片方法
  saveImgAction: function () {
    var that = this;
    wx.getImageInfo({
      src: this.data.code,
      success: function (sres) {
        wx.saveImageToPhotosAlbum({
          filePath: sres.path,
          success: function (fres) {
            app.util.notice('保存成功');
            that.setData({
              isShow2: false
            })
          }
        })
      },
      fail: function (sres) {
        that.notice('保存失败，请检查小程序官方后台配置');
      }
    })
  },
  closeRoom2: function () {
    console.log(1);
    this.setData({
      isShow2: false
    })
  },
  //跳转酒店详情页面
  navHotelDetail:function(){
    app.util.nav('hotel_detail/hotel_detail?id='+this.data.hotel.id)
  },
  //跳转到商城页面
  navShop:function(event){
    let sid=event.currentTarget.dataset.sid;
    app.util.nav('../shop/shop?sid='+sid)
  },
  //处理第二个海报弹窗
  powerDrawer2: function (event) {
    var currentStatu = event.currentTarget.dataset.statu;
    console.log(currentStatu);
    this.util2(currentStatu)
  },
    //第二个用来处理分享海报的弹窗
    util2: function (currentStatu) {
      /* 动画部分 */
      // 第1步：创建动画实例 
      var animation = wx.createAnimation({
        duration: 200, //动画时长
        timingFunction: "linear", //线性
        delay: 0 //0则不延迟
      });
  
      // 第2步：这个动画实例赋给当前的动画实例
      this.animation = animation;
  
      // 第3步：执行第一组动画：Y轴偏移240px后(盒子高度是240px)，停
      animation.translateY(240).step();
  
      // 第4步：导出动画对象赋给数据对象储存
      this.setData({
        animationData: animation.export()
      })
  
      // 第5步：设置定时器到指定时候后，执行第二组动画
      setTimeout(function () {
        // 执行第二组动画：Y轴不偏移，停
        animation.translateY(0).step()
        // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
        this.setData({
          animationData: animation
        })
  
        //关闭抽屉
        if (currentStatu == "close") {
          this.setData({
            showModalStatus2: false
          });
        }
      }.bind(this), 200)
  
      // 显示抽屉
      if (currentStatu == "open") {
        this.setData({
          showModalStatus2: true
        });
      }
    },
})