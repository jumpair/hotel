var app = getApp()
Page({


  data: {
    maintin:false,
    maintin_num:false,
    room:[],
    isshow:false
  },


  onLoad: function (options) {
    let id=options.id;
    var openid = wx.getStorageSync('openid');
    if (!openid){
      app.userLogin().then(res => {
        this.loadData(id);
      })
    }else{
      this.loadData(id);
    }
  },
  loadData: function(id){
    let that=this;
    app.util.get('entry/wxapp/AdminRoomDetail',{id:id}).then(res => {
      console.log(res);
      if (res.data!='0') {
         that.setData({
          room:res.data
         }) 
         if(res.data.isshow!='0'){
          that.setData({
            isshow:true
           }) 

         }
      }else{
        app.util.notice('没有权限进行此操作！');
      }
    })
  },
  hideRoomChange:function(e){
    var id=this.data.room.id;
    var op='updateRoomShow';
    var isshow = 0;
    if (e.detail.value) {
      isshow = 1;
      this.setData({
        isshow:true
      })
    }else{
      this.setData({
        isshow:false
      })
    }
    
    var that=this;
    app.util.get('entry/wxapp/AdminRoomDetail',{id:id,'op':op,'isshow':isshow}).then(res => {
      if (res.data!='0') {
        app.util.notice('操作成功');
        that.loadData(id);
      }else{
        app.util.notice('没有权限进行此操作！');
      }
    })
  },
  showNums:function(){
    this.setData({
      maintin_num:true
    })
  },
  
  showPrice:function(){
    this.setData({
      maintin:true
    })
  },
  maintin: function(t) {
    var a = this.data.maintin;
    0 == a ? this.setData({
        maintin: !0
    }) : this.setData({
        maintin: !1
    });
},
maintin_num: function(t) {
    var a = this.data.maintin_num;
    0 == a ? this.setData({
        maintin_num: !0
    }) : this.setData({
        maintin_num: !1
    });
},
  modify_price:function(t){
    var a = t.detail.value;
    //验证是，数字或 ，者两位小数，或者一位小数，整数
    var amtreg=/^\d+(\.\d{1,2})?$/;
    if(!amtreg.test(a)){
      app.util.notice("格式不正确！");
      return false;
    }
    let e = t.currentTarget.dataset.index;
    let i = this.data.room.pricelist; 
    let o = i[e].dateday;
    o = (o = o.replace("月", "-")).replace("日", " ");
    o = new Date().getFullYear() + "-" + o;
    i[e].mprice = a;
    let data={
      dateday: o,
      price: a,
      room_id: this.data.room.id,
      op:'updatePrice'
    }
    let that=this;
    app.util.get('entry/wxapp/AdminRoomDetail',data).then(res => {
      console.log(res);
      if (res.data!='0') {
        app.util.notice('更新成功');
        that.loadData(that.data.room.id);
      }
    })
  },


  modify_nums:function(t){
    var a = t.detail.value;
    // console.log(this.isInteger(a));
    
    // if(!this.isInteger(a)){
    //   app.util.notice("格式不正确！");
    //   return false;
    // }
    let e = t.currentTarget.dataset.index;
    let i = this.data.room.numlist; 
    let o = i[e].dateday;
    o = (o = o.replace("月", "-")).replace("日", " ");
    o = new Date().getFullYear() + "-" + o;
    i[e].nums = a;
    let data={
      dateday: o,
      nums: a,
      room_id: this.data.room.id,
      op:'updateNums'
    }
    let that=this;
    app.util.get('entry/wxapp/AdminRoomDetail',data).then(res => {
      console.log(res);
      if (res.data!='0') {
        app.util.notice('更新成功');
        that.loadData(that.data.room.id);
      }
    })
  },

  isInteger:function(obj) {

    return parseInt(obj, 10) === obj
   }



})