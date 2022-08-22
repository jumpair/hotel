var app = getApp()
Page({


  data: {
    list: [],
    lastid: 0,
    tid: 0,
    catname: '',
    copyright: '',
    cats: [],
    currentTabsIndex: 0,
    currentCatId: 0,
    fatherId: 0,
    blist: {},
    tcolor: '',
    cattype: '0',
    catkey: -1,//防止二次点击分类，出现数据重复加载的情况
  
    show_more: 0,
    bottomHeight: '70rpx',
  },

  onLoad: function (options) {
    app.util.handleTabbar('index');
    app.util.haveOid();
    let sid=options.sid;//商家id
  

    var tid = options.tid;

    //app.util.handleTabbar('shop');
  
    tid ? '' : tid = 0;
    this.setData({
      tid: tid,
      sid:sid
     })

    this.loadData(0);

  },

  loadMore: function (event) {
    var id = event.currentTarget.dataset.lastid
    this.loadData(id);
  },
  catClick: function (event) {
    var cid = event.currentTarget.dataset.cid;
    var fid = event.currentTarget.dataset.fid;
    var catkey = event.currentTarget.dataset.catkey;

    if (this.data.catkey != catkey) {
      this.setData({
        tid: cid,
        fid: fid,
        catkey: catkey,
        lastid: 0
      })
      this.loadData(0);
    }

  },

  loadData: function (lastid) {
    var that = this

    var uniacid = app.siteInfo.uniacid;
    var tid = that.data.tid;
    var fid = that.data.fid;
    var windowWidth=0;
    //获取手机分辨率
    wx.getSystemInfo({
      success: function (res) {
        windowWidth = res.windowWidth;
       
      }
    })
    app.util.request({
      url: 'entry/wxapp/shop',
      data: {
        m: 'fy_jiu',
        lastid: lastid,
        uniacid: uniacid,
        tid: tid,
        windowWidth: windowWidth,
        kind:0,
        sid:this.data.sid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            cats: res.data.data.cats
          })
          that.setData({
            currentTabsIndex: res.data.data.currentIndex,
            show_more: res.data.data.show_more
          })
         
          var len = res.data.data.list.length;
          var currentCatId = res.data.data.currentCatId;
          if (that.data.currentCatId != currentCatId) {
            that.setData({
              list: [],
              currentCatId: currentCatId
            })
          }
          if (len > 0) {
            var lastid = that.data.lastid + 8;
            that.setData({
              lastid: lastid
            })
            var arr = that.data.list
            var newarr = arr.concat(res.data.data.list);
            that.setData({
              list: newarr
            })
          }
          wx.setNavigationBarTitle({
            title: res.data.data.title,
          })
        }
      }
    });
 
  },

  onShareAppMessage: function (res) {
    let sid=this.data.sid;
    return {
      title: '商城',
      path: '/fy_jiu/pages/shop/shop?sid='+sid
    }
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
})