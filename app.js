var util = require('we7/resource/js/util.js');
App({
    globalData: {
      userInfo: null,
      code: '',
      openid: '',
      isIphoneX: false,
    },
    onShow: function () {
        let that = this;
        wx.getSystemInfo({
          success: res => {
            let modelmes = res.model;
            if (modelmes.search('iPhone X') != -1 || modelmes.search('iPhone XS Max') != -1 || 
            modelmes.search('iPhone XR') != -1 || modelmes.search('iPhone 11')!= -1 || modelmes.search('iPhone 11 Pro Max')!= -1 || modelmes.search('iPhone 11 Pro')!= -1 || modelmes.search('iPhone 12')!= -1 || modelmes.search('iPhone 12 Pro')!= -1 || modelmes.search('iPhone 12 Pro Max')!= -1 || modelmes.search('iPhone 13')!= -1 || modelmes.search('iPhone 13 Pro')!= -1 || modelmes.search('iPhone 13 Pro Max')!= -1 ) {
              that.globalData.isIphoneX = true;
            }
          }
        })
      },
      userLogin: function () {
        var that = this;
        //定义promise方法
        return new Promise(function (resolve, reject) {
          // 调用登录接口
          wx.login({
            success: function (res) {
              
              if (res.code) {
                var uniacid = that.siteInfo.uniacid;
                that.util.request({
                  url: 'entry/wxapp/GetUid',
                  data: {
                    m: 'fy_jiu',
                    code: res.code,
                    uniacid: uniacid
                  },
                  cachetime: 0,
                  success: function (res) {
                    if (!res.data.errno) {
                      wx.setStorageSync('openid', res.data.data.userinfo.openid);
                      wx.setStorageSync('sessionKey', res.data.data.userinfo.session_key);
                      resolve(res.data);
                    } else {
                      reject('error');
                    }
                  }
                });
              }
            }
          })
        })
      },
    util: util,
    userInfo: {
        sessionid: null,
    },
    siteInfo: require('siteinfo.js')
});