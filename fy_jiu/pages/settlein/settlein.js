var app = getApp();
Page({

  data: {
      username:'',
      phone:'',
      card:'',
      wechat:'',
      hotelname:'',
      hoteladdress:'',
      hotelkind:'',
      thumb1:'',
      thumb2:'',
      thumb3:'',
      status:'0',//审核状态0:填写信息,1:待审核,2:审核中，3：确认入驻
      start_settlein:0
  },

  onLoad:function(option){
     var openid = wx.getStorageSync('openid');
     var that=this;
     if (!openid) {
       app.userLogin().then(res => {
        that.getData();
       })
     }else{
        that.getData();
     }
  },
  getData:function(){
    app.util.get('entry/wxapp/settlein', {'op':'get'}).then(res => {
      console.log(res)
        if(!res.errno){
            this.setData({
              username:res.data.username,
              card:res.data.card,
              wechat:res.data.wechat,
              phone:res.data.phone,
              hotelname:res.data.hotelname,
              hoteladdress:res.data.hoteladdress,
              hotelkind:res.data.hotelkind,
              thumb1:res.data.thumb,
              thumb2:res.data.thumb1,
              thumb3:res.data.thumb2,
              status:res.data.status,
              start_settlein:res.data.start_settlein
            })
        }else{
            this.setData({
              start_settlein:res.data.start_settlein
            })
        }
    });

  },
  submit:function(){
    let item=this.data;
    if(item.status!='0'){
      this.notice('请勿重新提交');
      return false;
    }
    if(item.username==''){
      this.notice('姓名不能为空');
      return false;
    }
    var phone = this.checkPhone(item.phone);
    if (phone != '1') {
      this.notice('手机号不正确');
      return false;
    }
    if (!this.checkIDCard(this.data.card)) {
      this.notice('身份证号码格式错误');
      return false;
    }
    if(item.hotelname==''){
      this.notice('酒店名称不能为空');
      return false;
    }
    if(item.thumb1==''){
      this.notice('特种经营许可证不能为空');
      return false;
    }
    if(item.thumb2==''){
      this.notice('消防验收许可证不能为空');
      return false;
    }
    if(item.thumb3==''){
      this.notice('营业执照不能为空');
      return false;
    }
    
    
    let data={
      'username':item.username,
      'phone':item.phone,
      'card':item.card,
      'wechat':item.wechat,
      'hotelname':item.hotelname,
      'hoteladdress':item.hoteladdress,
      'hotelkind':item.hotelkind,
      'thumb':item.thumb1,
      'thumb1':item.thumb2,
      'thumb2':item.thumb3,
      'op':'add'
    }
    wx.showLoading({
      title: '正在上传请稍后',
    })
    app.util.get('entry/wxapp/settlein', data).then(res => {
      wx.hideLoading();
      console.log(res);
      var addUrl = app.util.url('entry/wxapp/settlein') + 'm=fy_jiu&op=img&aid='+res.data;
      let data1={};
      wx.showLoading({
					title: '正在上传请稍后',
        })
      //   var index = 0;
      // app.util.upload(addUrl, data1, item.thumb1).then(()=>{
      //   app.util.upload(addUrl, data1, item.thumb2)
        
      // }).then(()=>{
      //   app.util.upload(addUrl, data1, item.thumb3)
      // }).then(res=>{
      //   console.log(index)
      //   if(index == 2){
      //     wx.hideLoading();
      //     wx.showModal({
      //       title: '消息提示',
      //       content: '提交生成，工作人员收到后会第一时间跟你联系',
      //       success: function (res) {
      //         wx.navigateBack({
      //           delta: 1,
      //         })
      //       }
      //     })
      //   }
        
      // });
      async function f(){
          let loadImg1 =  app.util.upload(addUrl,data1,item.thumb1,'file')
          let loadImg2 =  app.util.upload(addUrl,data1,item.thumb2,'file1')
          let loadImg3=  app.util.upload(addUrl,data1,item.thumb3,'file2')

          let res = await Promise.all([loadImg1,loadImg2,loadImg3])

          

      }
      f().then(()=>{
        wx.hideLoading();
          wx.showModal({
            title: '消息提示',
            content: '提交生成，工作人员收到后会第一时间跟你联系',
            success: function (res) {
              wx.navigateBack({
                delta: 1,
              })
            }
          })
      })
    })
  },
  checkPhone: function (phone) {
    if (phone.length == 0) {
      return '请输入手机号码！';
    }
    if (phone.length != 11) {
      return '请输入有效的手机号码！'
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(14[0-9]{1})|(19[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(phone)) {
      return '请输入有效的手机号码！'
    }
    return '1'
  },

  checkIDCard: function (idcode) {
    // 加权因子
    var weight_factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验码
    var check_code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

    var code = idcode + "";
    var last = idcode[17]; //最后一个

    var seventeen = code.substring(0, 17);

    // ISO 7064:1983.MOD 11-2
    // 判断最后一位校验码是否正确
    var arr = seventeen.split("");
    var len = arr.length;
    var num = 0;
    for (var i = 0; i < len; i++) {
      num = num + arr[i] * weight_factor[i];
    }

    // 获取余数
    var resisue = num % 11;
    var last_no = check_code[resisue];

    // 格式的正则
    // 正则思路
    /*
    第一位不可能是0
    第二位到第六位可以是0-9
    第七位到第十位是年份，所以七八位为19或者20
    十一位和十二位是月份，这两位是01-12之间的数值
    十三位和十四位是日期，是从01-31之间的数值
    十五，十六，十七都是数字0-9
    十八位可能是数字0-9，也可能是X
    */
    var idcard_patter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;

    // 判断格式是否正确
    var format = idcard_patter.test(idcode);

    // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
    return last === last_no && format ? true : false;
  },
  cardInput: function (e) {
    this.setData({
      card: e.detail.value
    })
  },
  usernameInput: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  wechatInput: function (e) {
    this.setData({
      wechat: e.detail.value
    })
  },
  hotelnameInput: function (e) {
    this.setData({
      hotelname: e.detail.value
    })
  },
  hoteladdressInput: function (e) {
    this.setData({
      hoteladdress: e.detail.value
    })
  },
  hotelkindInput: function (e) {
    this.setData({
      hotelkind: e.detail.value
    })
  },
  //上传图片方法
  uploadAction:function(event){
    let id = event.currentTarget.dataset.id;
    console.log(id)
    let that=this;
    wx.chooseImage({
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res)
        let temImgUrl = res.tempFilePaths[0];
        if(id == 1){
          that.setData({ thumb1: temImgUrl })
        }else if(id==2){
          that.setData({ thumb2: temImgUrl })
        }else if(id == 3){
          that.setData({ thumb3: temImgUrl })
        }
        
      }
    })
  },
  del:function(event){
    let id = event.currentTarget.dataset.id;
    if(id == 1){
      this.setData({ thumb1:'' })
    }else if(id == 2){
      this.setData({ thumb2:'' })
    }else if(id ==3){
      this.setData({ thumb3:'' })
    }
    
  },
  notice: function (str) {
    wx.showModal({
      title: str,
      content: '',
      showCancel: false,
      success: function (res) {}
    })
  }
})