var QQMapWX = require('../../resource/js/qqmap-wx-jssdk.min.js');

Page({


  data: {
      list:[],
      markers: [{
        id: 0,
        width: 35,
        height: 35,
      }],
      map_key:'',
      traffic_list:[],
      learn_list:[],
      medical_list:[],
      bus_list:[],
      food_list:[],
      currentTab: 0,
      title:'',
      address:''

  },

  clickTab: function(t) {
  
    var a = this;
    if (a.data.currentTab === t.currentTarget.dataset.current) return !1;
    a.setData({
        currentTab: t.currentTarget.dataset.current
    });
},
  onLoad: function (options) {
    let marker=this.data.markers;
    marker[0]={
      latitude:options.lat,
      longitude:options.long,
    }
    this.setData({
      currentTab:options.tab,
      title:options.title,
      lat:options.lat,
      long:options.long,
      markers:marker,
      address:options.address,
      map_key:options.map_key
    })
    wx.setNavigationBarTitle({
      title: options.title+'周边设施',
    })
    let that=this;
    let loc=this.data.lat+','+this.data.long;
   
    var qqmapsdk = new QQMapWX({
      key: this.data.map_key // 必填
    });
    // console.log(res);return;
    qqmapsdk.search({
      keyword: '交通',
      location: loc,
      success: function (res) {
        
        that.setData({
          traffic_list:res.data
        })
      }
    })
    qqmapsdk.search({
      keyword: '教育',
      location: loc,
      success: function (res) {
        that.setData({
          learn_list:res.data
        })
      }
    })

    qqmapsdk.search({
      keyword: '医疗',
      location: loc,
      success: function (res) {
        that.setData({
          medical_list:res.data
        })
      }
    })
    qqmapsdk.search({
      keyword: '商业',
      location: loc,
      success: function (res) {
        that.setData({
          bus_list:res.data
        })
      }
    })
    qqmapsdk.search({
      keyword: '餐饮',
      location: loc,
      success: function (res) {
        that.setData({
          food_list:res.data
        })
      }
    })
  },
  //点击去楼盘地址
  gotoHouse:function(){
    wx.openLocation({
      latitude: Number(this.data.lat),
      longitude: Number(this.data.long),
      address: this.data.address
    })
  },
  //点击显示周边设施的位置
  gotoHere:function(event){
    let markres=this.data.markers;
    let lat=event.currentTarget.dataset.lat;
    let long=event.currentTarget.dataset.long   
    let marker=this.data.markers;
    marker[0]={
      latitude:lat,
      longitude:long,
      scale:17
    }
    this.setData({
      markers:marker,
      lat:lat,
      long:long
    })
   
  },
  mapSearch:function(location,cate){

  },
  testDis:function(){

  },
  formSubmit(e){
    var _this = this;
    //调用距离计算接口
    qqmapsdk.calculateDistance({
        //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
        //from参数不填默认当前地址
        //获取表单提交的经纬度并设置from和to参数（示例为string格式）
        from: e.detail.value.start || '', //若起点有数据则采用起点坐标，若为空默认当前地址
        to: e.detail.value.dest, //终点坐标
        success: function(res) {//成功后的回调
          console.log(res.result.elements[0].distance);
          var res = res.result;

          var dis = [];
          for (var i = 0; i < res.elements.length; i++) {
            dis.push(res.elements[i].distance); //将返回数据存入dis数组，
          }
          _this.setData({ //设置并更新distance数据
            distance: dis
          });
        },
        fail: function(error) {
          console.error(error);
        },
        complete: function(res) {
          console.log(res);
        }
    });
}

})