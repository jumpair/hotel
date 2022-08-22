var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    row:{},
    deposit:0,
    oid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var oid=options.oid;
    this.setData({
      oid:oid
    })
    var openid = wx.getStorageSync('openid');
    if (!openid){
      app.userLogin().then(res => {
        this.vailAdmin();

      })
    }else{
      this.vailAdmin();
    }
    
  },
  vailAdmin: function () {
    var that = this;
    app.util.get('entry/wxapp/Admin', {op:'vailadmin'}).then(res => {
      if (res.data != '0') {
        that.setData({
          isAdmin: true
        })
        that.getOrderInfo(that.data.oid);
      } else {
        that.notice('没有权限进行此操作！');
      }
    })


   
  },
  getOrderInfo: function(oid){
    var that = this;
    var uniacid = app.siteInfo.uniacid;
    app.util.request({
      url: 'entry/wxapp/Admin',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        op: 'orderinfo',
        oid:oid,
        openid:wx.getStorageSync('openid')
      },
      cachetime: 0,
      success: function (res) {
        console.log(res)
        if (!res.data.errno) {
          if(res.data=='999'){
            that.notice('您没有该门店订单的处理权限');
          }else{
            that.setData({
              row: res.data.data,
              deposit: res.data.data.deposit_total,
              perlist:res.data.data.rzlist
            })
          }
          
          
        }
      }
    });
  },
  updateStatus: function(event){
    var status = event.currentTarget.dataset.status;
    var that = this;
    // if(status=='3'){
    //   // wx.showModal({
    //   //   title: '确认不退还押金么',
    //   //   content: '',
    //   //   success: function (res) {
    //   //     if (!res.confirm) {
    //   //       return false;
    //   //     }else{
    //   //       that.handleUpdateStatus(status,that)
    //   //     }
    //   //   }
    //   // })
    //   that.handleUpdateStatus(status,that)
    // }else{
    //   that.handleUpdateStatus(status, that)
    // }
    that.handleUpdateStatus(status, that)
    
  },
  handleUpdateStatus:function(status,that){
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');
    var oid = that.data.row.oid
    app.util.request({
      url: 'entry/wxapp/Admin',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        op: 'updatestatus',
        oid: oid,
        status: status,
        openid: openid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setData({
            row: res.data.data
          })
        }else{
          wx.showToast({
            title: res.data.message,
          })
        }
      }
    }); 
  },
  t1: function (e) {
    this.setData({
      deposit: e.detail.value
    })
  },
  reFund: function(event){
    var that = this;
    wx.showModal({
      title: '确认要退还押金么',
      content: '',
      success: function (res) {
        if(!res.confirm){
            return false;
        }else{
          var uniacid = app.siteInfo.uniacid;
          var openid = wx.getStorageSync('openid');
          var oid = that.data.row.oid
          var status = event.currentTarget.dataset.status;
          if (status == 3) {
            var deposit = that.data.deposit
          } else {
            var deposit = that.data.row.total
          }
          app.util.request({
            url: 'entry/wxapp/Admin',
            data: {
              m: 'fy_jiu',
              uniacid: uniacid,
              op: 'refund',
              oid: oid,
              status: status,
              openid: openid,
              deposit: deposit
            },
            cachetime: 0,
            success: function (res) {
              if (!res.data.errno) {
                var row = that.data.row
                row.status_str = '已完成';
                row.status = 3;
                that.setData({
                  row: row
                })
              }
            }
          });
        }
      }
    })
    
  }, 
  notice: function (str) {
    wx.showModal({
      title: str,
      content: '',
      success: function (res) {
        wx.navigateTo({
          url: '../../index/index'
        })
      }
    })
  }
})