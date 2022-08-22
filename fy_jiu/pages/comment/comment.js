var app = getApp();
Page({
  data: {
    list:[],
    score:0,//门店分数
    scoreList:[1,2,3,4,5],//五角星列表
    commentTotal:0,//评论总数
  },

  onLoad: function (options) {
    let sid=options.sid;
 
    app.util.get('entry/wxapp/comment',{'sid':sid,'op':'list'}).then(res => {
      console.log(res);
      this.setData({
        list:res.data.list,
        score:res.data.score,
        commentTotal:res.data.comment_total
      })
      //处理好评星星个数
      let starNum=parseInt(res.data.score);
      this.setData({starNum:starNum});
      
    })
  },


   showImg:function(event){
    let _this = this;
    let src=event.currentTarget.dataset.src;
    let id=event.currentTarget.dataset.id;
    console.log(id);
    let thumb1=this.data.list[id].thumb1;
    let thumb2=this.data.list[id].thumb2;
    let thumb3=this.data.list[id].thumb3;
    let urls=[thumb1,thumb2,thumb3];
    let arr=[]
    for(let i = 0;i<3;i++){
      if(urls[i] !== ''){
        arr.push(urls[i])
      }
    }
 　　//图片预览
     wx.previewImage({
       current:src, // 当前显示图片的http链接
       urls:arr
     })
   },
   //过滤名字
   getName(name){
    return name
   },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})