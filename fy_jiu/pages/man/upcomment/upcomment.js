var app = getApp()
Page({
  data: {
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../../../resource/images/xing02.svg',
    selectedSrc: '../../../resource/images/xing01.svg',
    halfSrc: '../../../resource/images/xing01.svg',
    key: 0, //评分
    hotelName: '', //酒店名称
    oid: 0, //酒店评论的订单号
    sid: 0, //商户id
    thumb1: '', //三张评论图片
    thumb2: '',
    thumb3: '',
    content: '', //评论内容
    haoping: ['一般', '较满意', '满意', '很满意', '非常满意'],
    manyi: ''
  },
  onLoad: function (options) {
    this.setData({
      hotelName: options.hotelname,
      oid: options.oid,
      sid: options.sid,
      hotelUrl: options.thumb
    })
  },

  //添加到服务器
  submitAction: function () {
    
    let item = this.data;
    if(item.key == 0){
      wx.showToast({
        title: '请评分',
        icon:'error'
      })
      return false
    }
    // if (!item.thumb1 && !item.thumb2 && !item.thumb3) {
    //   wx.showToast({
    //     title: '你没有上传图片',
    //     icon: 'error'
    //   })
    //   return false;
    // }
    let that = this;
    let insertData = {
      'op': 'add',
      'content': item.content,
      'score': item.key,
      'oid': item.oid,
      'sid': item.sid
    }

    app.util.get('entry/wxapp/Comment', insertData).then(res => {

      let aid = res.data;
      var addUrl = app.util.url('entry/wxapp/Comment') + 'm=fy_jiu&op=img';
     
      let data1 = {
        'aid': aid
      },data2 = {
        'aid': aid
      },data3 = {
        'aid': aid
      };
      data1['adimg'] = 'thumb1';
      data2['adimg'] = 'thumb2';
      data3['adimg'] = 'thumb3';
      wx.showLoading({
        title: '正在上传...',
      })
      async function f(){
        let loadImg1 = item.thumb1 =='' || app.util.upload(addUrl,data1,item.thumb1,'file2')
        let loadImg2 =  item.thumb2 =='' || app.util.upload(addUrl,data2,item.thumb2,'file2')
        let loadImg3=  item.thumb3 =='' || app.util.upload(addUrl,data3,item.thumb3,'file2')
        let res = await Promise.all([loadImg1,loadImg2,loadImg3])
        console.log(res)

    }
      f().then(()=>{
        wx.hideLoading();
        that.navMan()
      }).catch(err=>{
        console.log(err)
      })
      // if (item.thumb1 != '' && item.thumb2 != '') {

      //   app.util.upload(addUrl, data, item.thumb1);
      //   data['adimg'] = 'thumb2';
      //   app.util.upload(addUrl, data, item.thumb2).then(res => {
      //     wx.hideLoading();
      //     that.navMan();
      //   });
      // } else if (item.thumb1 != '') {
      //   app.util.upload(addUrl, data, item.thumb1).then(res => {
      //     wx.hideLoading();
      //   });
      // } else if (item.thumb2 != '') {
      //   data['adimg'] = 'thumb2';
      //   app.util.upload(addUrl, data, item.thumb2).then(res => {
      //     wx.hideLoading();
      //     that.navMan();
      //   });
      // } else {
      //   that.navMan();
      // }

    })
  },
  navMan() {
    wx.showModal({
      title: '提示',
      content: '评论成功',
      showCancel: false,
      success(res) {
        if (res.confirm) {
          app.util.nav('/fy_jiu/pages/man/man?sid=10');
        }
      }
    })
  },
  selectLeft: function (e) {
    var key = e.currentTarget.dataset.key
    console.log(key)
    // if (this.data.key == 0.5 && e.currentTarget.dataset.key == 0.5) {
    //   //只有一颗星的时候,再次点击,变为0颗
    //   key = 0;
    // }
    console.log("得" + key + "分")
    this.setData({
      key: key,
      manyi: this.data.haoping[key - 1]
    })
  },
  //点击左边,整颗星
  selectRight: function (e) {
    var key = e.currentTarget.dataset.key
    console.log(key)
    console.log("得" + key + "分")
    this.setData({
      key: key,
      manyi: this.data.haoping[key - 1]
    })
  },
  //上传图片方法
  uploadAction: function (event) {
    let id = event.currentTarget.dataset.id;
    let that = this;
    wx.chooseImage({
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let temImgUrl = res.tempFilePaths[0];
        if (id == 1) {
          that.setData({
            thumb1: temImgUrl
          })
        } else if (id == 2) {
          that.setData({
            thumb2: temImgUrl
          })
        } else {
          that.setData({
            thumb3: temImgUrl
          })
        }
      }
    })
  },
  del: function (event) {
    let id = event.currentTarget.dataset.id;
    if (id == 1) {
      this.setData({
        thumb1: ''
      })
    } else if (id == 2) {
      this.setData({
        thumb2: ''
      })
    } else {
      this.setData({
        thumb3: ''
      })
    }
  },
  contentChange: function (e) {
    this.setData({
      content: e.detail.value
    })
  }

})