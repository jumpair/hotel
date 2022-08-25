var app = getApp()
import urils from '../../../resource/js/utils.js'
Page({

  
  data: {
    phone:'1',
    username:'',
    backimg: '',
    levelList:{},
    levelName:'',
    bottomHeight: '70rpx',
    cardnum:'',
    privacy:false,
    confirm:false,//是否确认流程
    getUserNickname: false,
  },


  onLoad: function (options) {
    console.log(wx.userinfo);
    this.setData({
      jnInfo:urils.getTopHeight().jnInfo,
      // getUserNickname:options.getUserNickname,
      // userinfo:options.userinfo,
      levelName1:options.levelName
      
    })
  },
  onShow: function () {

    var that = this
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/Userinfo',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
        op:'list'
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        if (!res.data.errno) {
          if(res.data.data.userData.phone && res.data.data.userData.username && res.data.data.userData.cardnum){
            that.setData({
              changeuser:'disabled'
            })
          }
          that.setData({
            backimg: res.data.data.backimg,
            phone: res.data.data.userData.phone,
            cardnum:res.data.data.userData.cardnum,
            username: res.data.data.userData.username,
            levelList: res.data.data.leverData,
            privacycon:res.data.data.privacycon,
            userinfo:res.data.data.userinfo,
            levelName: res.data.data.levelname
          })
        }
      }
    });
  },
  checkboxChange(e){
    this.setData({
      confirm:!this.data.confirm
    })
  },
  navBack(){
    wx.navigateBack({
      delta: 0,
    })
  },
  usernameAction: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  phoneAction: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  cardChange: function (e) {
    this.setData({
      cardnum: e.detail.value
    })
  },
  tanchutishi:function(){
    let that =this;
    that.setData({
      privacy:true
    })
  },
  closeyc:function(){
    let that =this;
    that.setData({
      privacy:false
    })
  },
  submitAction: function(){
    var that = this
    console.log('submitAction')
    var phone=this.data.phone
    var username=this.data.username
   
    if(phone=='' || username==''){
     wx.showModal({
       title: '',
       content: '姓名和手机号不能为空',
     });
     return false;
    }
    if (!this.checkIDCard(this.data.cardnum)) {
      this.notice('身份证号码格式错误');
      return false;
    }
    if(!this.data.confirm){
      wx.showModal({
        title:'请阅读隐私声明',
        content: '',
        success(res){
          if (res.confirm) {
            that.setData({
              confirm:true
            })
          }
          
        }
      })
      return false;
    }
    
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/Userinfo',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
        phone:phone,
        username:username,
        cardnum:this.data.cardnum,
        op:'edit'
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            phone: res.data.data.phone,
            username: res.data.data.username,
            cardnum:res.data.data.cardnum
          })
          wx.showModal({
            title: '',
            content: '修改成功',
          });
          setTimeout(item => {
            wx.navigateBack({
              delta: 1 //返回上一级页面
            })
          },2000)
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