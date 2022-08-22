var app = getApp();
Page({

  data: {
    style:[],
    list:[],
    blist: {},
    money: 0,
    rid:0,
    chargeMoney:'0',
    recharge_desc:'',
    hide_tabbar:0,
    bottomHeight: '70rpx',
  },

 
  onLoad: function (options) {
    app.util.handleTabbar('recharge');
  },

  onShow: function () {
    this.getContent();
  },
  //获取数据
  getContent: function(){
    var that = this
    var uniacid = app.siteInfo.uniacid;
    app.util.request({
      url: 'entry/wxapp/recharge',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid:wx.getStorageSync('openid')
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            money: res.data.data.money,
            list: res.data.data.list,
            recharge_desc: res.data.data.recharge_desc
          })
        }
      }
    });
  },
  clickCharge: function(event){
    //获取当前选中项目，处理选中状态
     var id=event.currentTarget.dataset.lid;
     var list = this.data.list;
     var check = list[id]['checked'];
     check == '0' ? check='1' : check='0';
     list[id]['checked'] = check;
     //把未选中的项目，取消之前的选中状态 
     for(var i=0;i<list.length;i++){
       if (list[i]['id'] != list[id]['id']){
         list[i]['checked']='0';
       }
     }

     this.setData({
       list:list
     })
  },
  chargeAction: function(e){
    
   var chargeMoney=e.detail.value;
   this.setData({
     chargeMoney: chargeMoney
   })
  },
  //提交充值事件
  submitAction: function(e){
    var list = this.data.list;
    var gid=0;
    //判断一下优惠选项是否有被选中的
    for (var i = 0; i < list.length; i++) {
      if (list[i]['checked'] =='1'){
        gid = list[i]['id'];
      }
    }
   
    //如果不为真，再判断用户手动输入的金额是否合法
    var chargeMoney=this.data.chargeMoney;
    if(gid=='0'){
      var r = /^(\-?\d+(\.\d+)?)$/; //使用正则判断是否为正整数
      if (!r.test(chargeMoney) || chargeMoney<=0){
        this.notice('充值金额不正确!');
        return false;
      }
    }
    this.handlePay(gid,chargeMoney);
    
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
        if (!res.data.errno) {
          that.paying(res.data.data.oid,res.data.data.money,uniacid);
        }
      }
    });
  },
  paying: function (oid, money, uniacid){
    var that=this;
    var url = app.siteInfo.siteroot;
    url = url.split('/app/')[0];
    var url1 = url;
    url = url + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/jsapi.php';
    var notifyUrl = url1 + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/test.php';
    wx.request({
      url: url,
      data: {
        openid: wx.getStorageSync('openid'),
        price: money,
        ordersn: oid,
        notifyUrl: notifyUrl,
        roomname: '充值订单'
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
            that.notice('充值成功');
            wx.redirectTo({
              url: '../user',
            })
          },
        })
      }
    })
  
  },

  tel: function () {
    var phone = this.data.blist.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  driver: function () {
    wx.openLocation({
      latitude: Number(this.data.blist.jing),
      longitude: Number(this.data.blist.wei),
      address: this.data.blist.address
    })
  },
  navigateMini: function (event) {
    var sid = event.currentTarget.dataset.sid;
    var appid = this.data.list[sid].appid;
    var pageaddress = this.data.list[sid].pageaddress;
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
  copy_action: function () {
    var copy = this.data.blist.copyright
    if (copy.copy_kind == '1') {
      var phone = copy.copy_phone
      wx.makePhoneCall({
        phoneNumber: phone,
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
})