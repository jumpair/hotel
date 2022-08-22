// fy_jiu/pages/tixian/tixian.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yanghangka:'',
    tixian: '',
    money: 0,
    draw_way: true,
    draw_way1: false,
    draw_way2: false,
    weixin_input: '',
    items: [{
        name: '0',
        value: '微信',
        checked: true
      },
      {
        name: '1',
        value: '支付宝',

      },
      {
        name: '2',
        value: '银行卡',

      },
      {
        name: '3',
        value: '余额',

      },
    ],
    id: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    // if(option.id){
    //   this.setData({ id: option.id});
    //   this.getmydistribution();
    // }
    this.getmydistribution();

  },

  getmydistribution: function () {
    var that = this;
    var uniacid = app.siteInfo.uniacid;
    var openid = wx.getStorageSync('openid');

    app.util.request({
      url: 'entry/wxapp/MyDistribution',
      data: {
        m: 'fy_jiu',
        uniacid: uniacid,
        openid: openid,
      },
      cachetime: 0,
      success: function (res) {
        console.log(res.data.data)
        that.setData({
          money: res.data.data.allprice,
          // money:'100000',
          withdraw:res.data.data.withdrawsys
        });
      }
    });
  },
  //全部提现
  allIn() {
    var tixian = this.data.money
    this.setData({
      tixian
    })
  },
  //改变金额
  moneychange(e) {
    console.log(e)
    let m = parseFloat(e.detail.value);
    this.checkMoney(m)
  },
  checkMoney(m) {
    if (m > this.data.money) {
      this.notice('提现金额不能超过总收益')
      this.setData({
        tixian: this.data.money
      })
      return false
    }
    var amtreg = /^\d+(\.\d{1,2})?$/;
    if (!amtreg.test(m)) {
      this.notice('请输入正确的金额格式！')
      return false;
    }
    this.setData({
      tixian: m
    })
    return true
  },

  //姓名
  bindInputName: function (e) {
    // console.log('666', e)
    this.setData({
      name_input: e.detail.value
    })
  },
  //开户行
  bindInputKaihuhang: function (e) {
    // console.log('555', e.detail.value)
    this.setData({
      kaihuhang: e.detail.value
    })
  },
  //银行卡
  bindInputYinHangka: function (e) {
    // console.log('666', e)
    this.setData({
      yanghangka: e.detail.value
    })
  },
  //电话输入
  bindInputPhone: function (e) {
    // console.log('555', e.detail.value)
    this.setData({
      phone: e.detail.value
    })
  },
  //微信
  bindInputWeinXin: function (e) {
    // console.log('666', e)
    this.setData({
      weixin_input: e.detail.value
    })
  },
  //支付宝
  bindInputZhiFubao: function (e) {
    // console.log('666', e)
    this.setData({
      weixin_input: e.detail.value
    })
  },



  notice: function (str) {
    wx.showModal({
      title: str,
      content: '',
      showCancel: false,
      success: function (res) {}
    })
  },

  checkPhone: function (phone) {
    if (phone == '') {
      return '请输入手机号码！';
    }
    if (phone.length != 11) {
      return '请输入有效的手机号码！'
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(14[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(phone)) {
      return '请输入有效的手机号码！'
    }
    return '1'
  },
 
  // 返利到哪里 fanli2where
  fanli2where: function () {
    var that = this;
    // var id = that.data.id;
    var name = that.data.name_input
    var txmoney = that.data.tixian;
    var openid = wx.getStorageSync('openid');
    var kaihuhang = that.data.kaihuhang

    var yanghangka = that.data.yanghangka
    var withdraw = that.data.withdraw

    if(withdraw.lowest_money > txmoney){
      that.notice('提现金额最低为'+withdraw.lowest_money)
      return false;
    }

    if (txmoney == '') {
      that.notice('提现金额不能为空')
      return false;
    }else{
      if(!that.checkMoney(parseFloat(txmoney))){
        return false;
      }
    }
    if (!name) {
      that.notice('姓名不能为空')
      return false;
    }

    if (!kaihuhang) {
      that.notice('开户行不能为空')
      return false;
    }

    if (!this.CheckBankNo(yanghangka)) {
      return false;
    }
    var data = {
      m: 'fy_jiu',
      txmoney: txmoney,
      name,
      kaihuhang,
      yanghangka,
      openid: openid,
      uniacid: app.siteInfo.uniacid,
    };

    console.log('lyj data 是什么', data);
    // return ;

    app.util.request({
      url: 'entry/wxapp/fanli2where',
      data: data,
      cachetime: 0,
      success: function (res) {
        console.log('lyj 返利申请回调', res);
        wx.showToast({
          title: res.data.message,
          icon: 'success',
          duration: 2000
        });

        wx.navigateTo({
          url: '../records/records',
        })
      }
    });
  },
  luhnCheck(bankno){
    var lastNum=bankno.substr(bankno.length-1,1);//取出最后一位（与luhn进行比较）
   
       var first15Num=bankno.substr(0,bankno.length-1);//前15或18位
       var newArr=new Array();
       for(var i=first15Num.length-1;i>-1;i--){    //前15或18位倒序存进数组
           newArr.push(first15Num.substr(i,1));
       }
       var arrJiShu=new Array();  //奇数位*2的积 <9
       var arrJiShu2=new Array(); //奇数位*2的积 >9
       
       var arrOuShu=new Array();  //偶数位数组
       for(var j=0;j<newArr.length;j++){
           if((j+1)%2==1){//奇数位
               if(parseInt(newArr[j])*2<9)
               arrJiShu.push(parseInt(newArr[j])*2);
               else
               arrJiShu2.push(parseInt(newArr[j])*2);
           }
           else //偶数位
           arrOuShu.push(newArr[j]);
       }
       
       var jishu_child1=new Array();//奇数位*2 >9 的分割之后的数组个位数
       var jishu_child2=new Array();//奇数位*2 >9 的分割之后的数组十位数
       for(var h=0;h<arrJiShu2.length;h++){
           jishu_child1.push(parseInt(arrJiShu2[h])%10);
           jishu_child2.push(parseInt(arrJiShu2[h])/10);
       }        
       
       var sumJiShu=0; //奇数位*2 < 9 的数组之和
       var sumOuShu=0; //偶数位数组之和
       var sumJiShuChild1=0; //奇数位*2 >9 的分割之后的数组个位数之和
       var sumJiShuChild2=0; //奇数位*2 >9 的分割之后的数组十位数之和
       var sumTotal=0;
       for(var m=0;m<arrJiShu.length;m++){
           sumJiShu=sumJiShu+parseInt(arrJiShu[m]);
       }
       
       for(var n=0;n<arrOuShu.length;n++){
           sumOuShu=sumOuShu+parseInt(arrOuShu[n]);
       }
       
       for(var p=0;p<jishu_child1.length;p++){
           sumJiShuChild1=sumJiShuChild1+parseInt(jishu_child1[p]);
           sumJiShuChild2=sumJiShuChild2+parseInt(jishu_child2[p]);
       }      
       //计算总和
       sumTotal=parseInt(sumJiShu)+parseInt(sumOuShu)+parseInt(sumJiShuChild1)+parseInt(sumJiShuChild2);
       
       //计算luhn值
       var k= parseInt(sumTotal)%10==0?10:parseInt(sumTotal)%10;        
       var luhn= 10-k;
       
       if(lastNum==luhn){
          console.log("验证通过");
           return true;
       }else{
        this.notice("银行卡号必须符合luhn校验");
           return false;
       }        
   },
   
   //检查银行卡号
   CheckBankNo(bankno) {
       var bankno = bankno.replace(/\s/g,'');
       if(bankno == "") {
           this.notice("请填写银行卡号");
           return false;
       }
       if(bankno.length < 16 || bankno.length > 19) {
        this.notice("银行卡号长度必须在16到19之间");
           return false;
       }
       var num = /^\d*$/;//全数字
       if(!num.exec(bankno)) {
        this.notice("银行卡号必须全为数字");
           return false;
       }
       //开头6位
       var strBin = "10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99";
       if(strBin.indexOf(bankno.substring(0, 2)) == -1) {
        this.notice("银行卡号开头6位不符合规范");
           return false;
       }
       //Luhn校验
       if(!this.luhnCheck(bankno)){
           return false;
       }
       return true;
   },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})