var app = getApp();
Page({
  data: {
    cityList: [],
    cid: 0,
    city: '',
    history_list: []
  },
  onLoad: function (options) {
    let cid = wx.getStorageSync('cid');
    let history_list = wx.getStorageSync('history_list');
    this.setData({
      history_list,
      cid
    })
    var this_ = this
    //获取城市列表
    app.util.get('entry/wxapp/city', {
      'cid': cid
    }).then(res => {
      this.setData({
        cityList: res.data,
      })
    })
    //获取定位坐标
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let positon = res.latitude.toString() + ',' + res.longitude.toString()
        //返回坐标对应的城市
        this_.getContent(positon)
      },
      fail: function (res) {

      }
    })
  },
  getContent: function (position) {
    app.util.get('entry/wxapp/index', {
      'position': '37.54061,121.40011'
    }).then(res => {
      this.setData({
        'city': res.data.city,
      })
    })
  },
  //搜索
  search(e) {
    wx.showLoading({
      title: '加载中',
    });
    
    let keyword = e.detail.value
    if(keyword.length){
      let history_list = wx.getStorageSync('history_list')
      if(history_list == ''){
        history_list=[]
      }
      console.log(history_list)
      history_list.unshift(keyword)
      wx.setStorageSync('history_list',history_list)
      this.setData({
        history_list
      })
    }
    this.getSearch(keyword)
  },
  //清楚历史搜索
  clearHistory(){
    wx.setStorageSync('history_list',[])
    this.setData({
      history_list:[]
    })
  },
  //历史记录搜索
  historySearch(e){
    let keyword = e.currentTarget.dataset.keyword
    this.getSearch(keyword)
  },
  //搜索get封装
  getSearch(keyword){
    var _this = this
    app.util.get('entry/wxapp/Searchcity', {
      keyword
    }).then(res => {
      wx.hideLoading()
      let cityList = res.data.searchcity;
      if(cityList.length>0){
        _this.setData({
          cityList
        })
      }else{
        wx.showToast({
          icon:'error',
          title: '暂无该城市相关信息',
        })
      }
     
    })
  },
  cityTap: function (event) {
    var pages = getCurrentPages();
    var prepages = pages[pages.length - 2];
    let cid = event.currentTarget.dataset.val;
    let city = event.currentTarget.dataset.city;
    wx.setStorageSync('cid', cid);
    if (prepages.route == 'fy_jiu/pages/list/list') {
      // let url = '../list/list?inDate=' + prepages.data.inDate + '&inDate2=' + prepages.data.inDate2 + '&outDate=' + prepages.data.outDate + '&outDate2=' + prepages.data.outDate2 + '&cid=' + cid + '&city=' + city + '&diffDay=' + prepages.data.diffDay
      // app.util.nav(url);
      prepages.setData({
        cid:cid,
        city:city
      })
      prepages.getData()
      wx.navigateBack({});
    } else {
      wx.reLaunch({
        url: '../index/index?cid=' + cid
      })
    }



  }
})