var Moment = require("../../../we7/resource/js/moment.js");
var app = getApp();

import urils from '../../resource/js/utils.js'
Page({
  data: {
    current: 0,
    banner: [],
    city:'',//城市名称
    cid:0,//城市id
    slider:[],//幻灯片
    inDate:'',//入住日期 (2020-07-19)
    outDate:'',//离店日期
    inDate2:'',//入住日期(07月19号)
    outDate2:'',//离店日期
    diffDay:1,//入住天数
    list:[],
    list_style:0,//列表样式
    share_title:'',
    share_thumb:'',
    share_icon:'',
    index_name:'',//首页推荐商家的文字显示
    hotCityList:[],//首页热门城市列表
    bulletinlist:[],//公告列表
    searchKeyword:'',//搜索关键词
  },
  swiper: function (e) {
    this.setData({
      current: e.detail.current
    })
  },
  onLoad:function(options){
    this.setData({
      jnInfo:urils.getTopHeight().jnInfo
    })
    app.util.haveOid();


     //处理通过海报进入的用户
     var scene = options.scene;
     if (scene != '' && scene != undefined) {
       this.handleBill(scene);
     }else{
        //先判断是不是通过城市页面选择过来的
        
        if(options.cid!=undefined){
          this.getContent(0, options.cid);
        }else{
          //在判断是不是之前已经确定好城市了
          let cid = wx.getStorageSync('cid');
   
          if (cid){
            this.getContent(0,cid);
          }else{
            var position = wx.getStorageSync('position');
            //获取位置，定位到最近的楼盘
            if (position == '' || !position) {
              app.util.getLocation().then(res=>{
                this.getContent(res, 0);
              })    
            }else{
              this.getContent(position, 0);
            } 
           
          }
        }

     }

    
   
    app.util.handleTabbar('index');

    app.util.get('entry/wxapp/TabBar', {}).then(res=>{
      this.setData({
        index_h1:res.data.title
      })
    })
  },
 
  
  
  getContent:function(position,cid){
    var that = this
    
    app.util.get('entry/wxapp/index', {  'position':position,'cid':cid,'openid':wx.getStorageSync('openid')}).then(res => {
        this.setData({
          'cid':res.data.cid,
          'city':res.data.city,
          'inDate': res.data.indate,
          'outDate':res.data.outdate,
          'inDate2': res.data.indate2,
          'outDate2':res.data.outdate2,
          'banner':res.data.banner,
          'list':res.data.list,
          'list_style':res.data.list_style,
          'share_title':res.data.share_title,
          'share_icon':res.data.share_icon,
          'share_thumb':res.data.share_thumb,
          'index_name':res.data.index_name,
          'hotCityList':res.data.hotcitylist,
          'bulletinlist':res.data.bulletinlist
        })
    })


  },
   //获取搜索关键词
   searchInputChange(e){
    let searchKeyword = e.detail.value
    this.setData({
      searchKeyword
    })
  },
  //处理海报进来的客户
  handleBill:function(scene){
    console.log(222);
    if (scene.indexOf('-') != -1) {  //员工跳转到订单管理页面
      scene = scene.split('-');
      wx.navigateTo({
        url: '../admin/orderinfo/orderinfo?oid=' + scene[0],
      })
    } else if (scene.indexOf('*') != -1) {  //客户从海报进入的，跳转到酒店详情
      //scene = scene.split('*');
      wx.navigateTo({
        url: '../hotel/hotel?scene='+scene
      })
    } else if (scene.indexOf('~') != -1) {  //客户从海报进入的，跳转到酒店详情
      //scene = scene.split('*');
      wx.navigateTo({
        url: '../user/user?scene='+scene
      })
    }

  },
  //重新定位
  rePosition:function(){
    // let position=app.util.getLocation();
    // wx.showToast({
    //   title: '更新成功！',
    // })
    app.util.getLocation().then(res=>{
      wx.showToast({
        title: '更新成功！',
      })
      this.getContent(res, 0);
    })
    
  },
  //幻灯片跳转小程序
  navApp: function (event){
    var appid = event.currentTarget.dataset.appid;
    var pageaddress = event.currentTarget.dataset.pageaddress;
    wx.navigateToMiniProgram({
      appId: appid,
      path: pageaddress,
      success(res) {
      }
    })
  },
  //跳转到酒店列表
  navHotelList:function(){
    let url='../list/list?inDate='+this.data.inDate+'&inDate2='+this.data.inDate2+'&outDate='+this.data.outDate+'&outDate2='+this.data.outDate2+'&cid='+this.data.cid+'&city='+this.data.city+'&diffDay='+this.data.diffDay+'&keyword='+this.data.searchKeyword
    app.util.nav(url);
  },
  //热门城市列表跳转
  clickCity(event){
    let index=event.currentTarget.dataset.index;
   
    let city=this.data.hotCityList[index];

    let url='../list/list?inDate='+this.data.inDate+'&inDate2='+this.data.inDate2+'&outDate='+this.data.outDate+'&outDate2='+this.data.outDate2+'&cid='+city.id+'&city='+city.city+'&diffDay='+this.data.diffDay
    app.util.nav(url);
   
  },
  //跳转到酒店详情页
  navHotelDetail:function(event){
    let id=event.currentTarget.dataset.id;
    let url='../hotel/hotel?inDate='+this.data.inDate+'&inDate2='+this.data.inDate2+'&outDate='+this.data.outDate+'&outDate2='+this.data.outDate2+'&cid='+this.data.cid+'&city='+this.data.city+'&diffDay='+this.data.diffDay+'&id=' + id;
    app.util.nav(url);
  },

  navCity:function(){
    app.util.nav('../city/city')
  },
  navCalc:function(){
    app.util.nav('../calendar/index?&checkInDate='+this.data.inDate+'&checkOutDate='+this.data.outDate);
  },
  //处理版权点击动作
  copy_action:function(){
    app.util.handelCopyAction();
  },
  //底部导航跳转
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

  onShareAppMessage:function(){
    return {
      title: this.data.share_title,
      path: '/fy_jiu/pages/index/index',
      imageUrl:this.data.share_thumb
    } 
  },
  onShareTimeline:function(){
    return {
      title: this.data.share_title,
      query: {},
      imageUrl: this.data.share_thumb
    }
  }

})