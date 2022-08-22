var app = getApp()
import urils from '../../../resource/js/utils.js'
Page({


    data: {

    },


    onLoad: function (options) {
        this.setData({
            jnInfo: urils.getTopHeight().jnInfo,

        })
        var that = this
        var uniacid = app.siteInfo.uniacid;
        var openid = wx.getStorageSync('openid');
        app.util.request({
            url: 'entry/wxapp/user',
            data: {
                m: 'fy_jiu',
                uniacid: uniacid,
                openid: openid
            },
            cachetime: 0,
            success: function (res) {
              console.log(res);

                if (!res.data.errno) {
                    res = res.data.data
                    console.log(res)
                    that.setData({
                        levellist:res.level,
                        userlevel:res.userlevel,
                        levelname:res.levelname,
                        showRenewal:res.showRenewal,
                        end_time: res.end_time
                    })
                }
            }
        });
    },

    navBack() {
        wx.navigateBack({
            delta: 0,
        })
    },

    notice: function (str) {
        wx.showModal({
            title: str,
            content: '',
            success: function (res) {}
        })
    },
    upgrade: function () {
        var that = this;
        var openid = wx.getStorageSync('openid');
        var uniacid = app.siteInfo.uniacid;
        app.util.request({
            url: 'entry/wxapp/userlevel',
            data: {
                m: 'fy_jiu',
                openid: openid,
                uniacid: uniacid
            },
            cachetime: 0,
            success: function (res) {
                console.log(res);
                that.setData({
                    gid: res.data.data.gid,
                    chargeMoney: res.data.data.levelcost,
                    pid:res.data.data.pid,
                    level: res.data.data.level
                })
                that.handlePay('', res.data.data.levelcost);
            }
        });
    },
    //处理付款信息
    handlePay: function (gid, chargeMoney) {

        var that = this;
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
                console.log(res);
                if (!res.data.errno) {
                    that.paying(res.data.data.oid, chargeMoney, uniacid);
                }
            }
        });
    },
    paying: function (oid, money, uniacid) {
        var that = this;
        var url = app.siteInfo.siteroot;
        url = url.split('/app/')[0];
        var url1 = url;
        url = url + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/chinaums.php';
        var notifyUrl = url1 + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/chinaumsnotify.php';
        // url = url + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/jsapi.php';
        // var notifyUrl = url1 + '/addons/fy_jiu/pay' + app.siteInfo.uniacid + '/example/test.php';
        wx.request({
            url: url,
            data: {
                openid: wx.getStorageSync('openid'),
                price: money,
                ordersn: oid,
                notifyUrl: notifyUrl,
                roomname: '会员升级'
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
                  'signType': data.signType,
                  'paySign': data.paySign,
                  'success': function (pres) {
                    // console.log(pres);return
                    app.util.request({
                      url: 'entry/wxapp/changelevel',
                      data: {
                        m: 'fy_jiu',
                        openid: wx.getStorageSync('openid'),
                        uniacid: app.siteInfo.uniacid,
                        merOrderId: data.merOrderId,
                        ordersn: oid,
                        pid:that.data.pid,
                        level:that.data.level
                      },
                      cachetime: 0,
                      success: function(res) {
                        wx.redirectTo({
                          url: '../user',
                        })
                      }
                    });
        
                  },
                })
            }
        })

    }
})