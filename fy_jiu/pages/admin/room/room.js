var app = getApp()
Page({


  data: {
      list:[]
  },


  onLoad: function (options) {
    var openid = wx.getStorageSync('openid');
    if (!openid){
      app.userLogin().then(res => {
        this.loadData();
      })
    }else{
      this.loadData();
    }
  },

  loadData: function(){
    let that=this;
    app.util.get('entry/wxapp/AdminRoom').then(res => {
      console.log(res);
      if (res.data!='0') {
         that.setData({
          list:res.data
        
         }) 
      }else{
        that.notice('没有权限进行此操作！');
      }
    })
  },

  manRoom:function(event){
    let id=event.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: './roomDetail?id='+id,
    })
  }
    


})