var app = getApp();
Page({
    data: {
        current: 1,
        top: 0,
        hotel: [],
        hardarr: [],
        markers: [{
            id: 0,
            width: 30,
            height: 30,
            latitude: 22.540430,
            longitude: 113.934540,
        }], //地图初始化
        map_key: '', //腾讯地图api
        score: 0, //门店分数
        commentTotal: 0, //评论总数
        commentList: [],
        follow: 0,
        toView:"id01"
    },
    onLoad: function (options) {
        let id = options.id; //酒店主键id
        app.util.get('entry/wxapp/hotelDetail', {
            'id': id,
            'openid': wx.getStorageSync('openid')
        }).then(res => {
            console.log(res);
            this.setData({
                hotel: res.data.hotel,
                hardarr: res.data.hardarr,
                map_key: res.data.map_key,
                score: res.data.score,
                commentTotal: res.data.comment_total,
                commentList: res.data.comment_list,
                follow: res.data.follow
            })
            if (res.data.hotel.position != '') {
                let po = res.data.hotel.position.split(',');
                let marker = this.data.markers;
                marker[0] = {
                    latitude: po[0],
                    longitude: po[1],
                }
                this.setData({
                    markers: marker
                })
            }

        })
        
    },
    onReady: function (e) {
      var that = this
      var query = wx.createSelectorQuery()
      query.select('#id01').boundingClientRect(function (res) {
         that.setData({
           id01:res.top
         })
      }).exec();


      query.select('#id02').boundingClientRect(function (res) {
         that.setData({
           id02:res.top
         })
      }).exec();
      query.select('#id03').boundingClientRect(function (res) {
         that.setData({
           id03:res.top
         })
      }).exec();
      query.select('#id04').boundingClientRect(function (res) {
         that.setData({
           id04:res.top
         })
      }).exec();
      query.select('#id05').boundingClientRect(function (res) {
         that.setData({
           id05:res.top
         })
      }).exec();
  },

    //关注本店
    follow: function (event) {
        let id = this.data.hotel.id;
        let op = event.currentTarget.dataset.op;
        console.log(op);
        app.util.get('entry/wxapp/follow', {
            'id': id,
            'op': op
        }).then(res => {
            if (op == 'add') {
                this.setData({
                    follow: 1
                })
                app.util.notice('已成功关注');
            } else {
                this.setData({
                    follow: 0
                })
                app.util.notice('已成功取消关注');
            }

        })
    },
    //跳转到评论页面
    navComment: function () {
        wx.navigateTo({
            url: '../../comment/comment?sid=' + this.data.hotel.id,
        })
    },
    tabbtn: function (e) {
        this.setData({
            current: e.currentTarget.dataset.index
        })
        if (e.currentTarget.dataset.index == 1) {
            this.setData({
              toView: 'id01'
            })
        }
        if (e.currentTarget.dataset.index == 2) {
            this.setData({
              toView: 'id02'
            })
        }
        if (e.currentTarget.dataset.index == 3) {
            this.setData({
              toView: 'id03'
            })
        }
        if (e.currentTarget.dataset.index == 4) {
            this.setData({
              toView: 'id04'
            })
        }
        if (e.currentTarget.dataset.index == 5) {
            this.setData({
              toView: 'id05'
            })
        }
    },
    scrollchange: function (e) {
      var item = this.data
        if (e.detail.scrollTop > 1 && e.detail.scrollTop < this.data.id02) {
            this.setData({
                current: 1
            })
        }
        if (e.detail.scrollTop > this.data.id02 && e.detail.scrollTop < this.data.id03) {
            this.setData({
                current: 2
            })
        }
        if (e.detail.scrollTop > this.data.id03 && e.detail.scrollTop < this.data.id04) {
            this.setData({
                current: 3
            })
        }
        if (e.detail.scrollTop > this.data.id04 && e.detail.scrollTop < this.data.id05) {
            this.setData({
                current: 4
            })
        }
        if (e.detail.scrollTop > 600) {
            this.setData({
                current: 5
            })
        }
    },
    //拨打电话
    tel: function () {
        let phone = this.data.hotel.phone
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },
    //跳转地图周边设施
    navMap: function (event) {
        let tab = event.currentTarget.dataset.tab;
        let url = '../../map/map?tab=' + tab + '&title=' + this.data.hotel.title + '&lat=' + this.data.markers[0].latitude + '&long=' + this.data.markers[0].longitude + '&address=' +
            this.data.hotel.address + '&map_key=' + this.data.map_key
        app.util.nav(url);
    },
    navBack: function () {
        wx.navigateBack({
            delta: -1,

        })
    },


})