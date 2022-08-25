var app = getApp();
Page({


  data: {
    inDate: '', //入住日期 (2020-07-19)
    outDate: '', //离店日期
    inDate2: '', //入住日期(07月19号)
    outDate2: '', //离店日期
    diffDay: 1, //入住天数 
    cid: 0,
    city: '',
    url: '', //跳转酒店页面的链接
    keyword:'',//搜索关键词
    dropDownMenuTitle: ['位置区域', '推荐排序', '距离排序'],
    dropDownMenuSecondData: [{
        id: 1,
        title: '推荐排序'
      },
      {
        id: 2,
        title: '低价优先'
      },
      {
        id: 3,
        title: '高价优先'
      },
      {
        id: 4,
        title: '好评优先'
      }
    ],

    //排序数据
    dropDownMenuFirstData: [],

    dropDownMenuThirdData: [{
        id: 1,
        title: '1KM内'
      },
      {
        id: 2,
        title: '2KM内'
      },
      {
        id: 3,
        title: '4KM内'
      },
      {
        id: 4,
        title: '5KM内'
      }
    ]
  },

  onLoad: function (options) {
    //检查定位
    var position = wx.getStorageSync('position');
    if (position == '' || !position) {
      position = app.util.getLocation();
    }
    let cid = options.cid;
    let city = options.city;
    this.setData({
      inDate: options.inDate,
      inDate2: options.inDate2,
      outDate: options.outDate,
      outDate2: options.outDate2,
      cid: options.cid,
      city: options.city,
      diffDay: options.diffDay,
      position:position,
      keyword:options.keyword||''
    });
    this.getData(options)

  },
  changeKeyword(e){
    let keyword = e.detail.value;
    this.setData({
      keyword
    })
  },
  keywordSearch(){
    let options = {
      keyword:this.data.keyword
    }
    this.getData(options)
  },
  getData(options){
    // app.util.handleTabbar('list');
    app.util.haveOid();

    //检查定位
    var position = wx.getStorageSync('position');
    if (position == '' || !position) {
      position = app.util.getLocation();
    }
  

    //改造一下时间的格式，改成01.01
    let arr = this.data.inDate.split('-');
    let newInDate = arr[1] + '.' + arr[2];
    let arr2 = this.data.outDate.split('-');
    let newOutDate = arr2[1] + '.' + arr2[2];
    this.setData({
      newInDate: newInDate,
      newOutDate: newOutDate
    })

    app.util.get('entry/wxapp/HotelList', {
      'position': position,
      'cid': this.data.cid,
      'indate': this.data.inDate,
      'outdate': this.data.outDate,
      'keyword': this.data.keyword
    }).then(res => {
      console.log(res.data)
      this.setData({
        list: res.data.list,
        dropDownMenuFirstData:res.data.maps
      })
      wx.setNavigationBarTitle({
        title: this.data.city + '的商家列表',
      })
    })
  },
  selectedFourth: function (e) {
    console.log(e.detail);
    console.log("选中第" + e.detail.index + "个标签，选中的id：" + e.detail.selectedId + "；选中的内容：" + e.detail.selectedTitle);
    //kind为第一个筛选选项卡
    //selectFirstLevelId 1为区域选择，2为推荐排序，3为距离排序
    //selectedId 为二级id
    let kind=e.detail.index;
    let firstselectid=e.detail.selectFirstLevelId;
    let secondselectid=e.detail.selectedId;
    app.util.get('entry/wxapp/HotelList', {
      'position': this.data.position,
      'cid': this.data.cid,
      'indate': this.data.inDate,
      'outdate': this.data.outDate,
      'secondselectid':secondselectid,
      'firstselectid':firstselectid,
      'kind':kind
    }).then(res => {
      console.log(res.data.list);
      this.setData({
        list: res.data.list
      })
     
    })

  },
  navCity() {
    app.util.nav('../city/city')
  },
  navBack() {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  navHotel: function (event) {
    let id = event.currentTarget.dataset.id;
    let url = '../hotel/hotel?inDate=' + this.data.inDate + '&inDate2=' + this.data.inDate2 + '&outDate=' + this.data.outDate + '&outDate2=' + this.data.outDate2 + '&cid=' + this.data.cid + '&city=' + this.data.city + '&diffDay=' + this.data.diffDay;
    url = url + '&id=' + id;
    app.util.nav(url);
  },

  navCale() {
    app.util.nav('../calendar/index?checkInDate=' + this.data.inDate + '&checkOutDate=' + this.data.outDate)
  },
  //处理版权点击动作
  copy_action: function () {
    app.util.handelCopyAction();
  },
  //底部导航跳转
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
  onShareAppMessage: function () {

  }
})