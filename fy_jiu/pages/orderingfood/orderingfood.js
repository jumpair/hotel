// 右侧每一类的 bar 的高度（固定）
const RIGHT_BAR_HEIGHT = 20;
// 右侧每个子类的高度（固定）
const RIGHT_ITEM_HEIGHT = 120;
// 左侧每个类的高度（固定）
const LEFT_ITEM_HEIGHT = 50;

var app = getApp();

Page({
  data: {
    // 是否显示下面的购物车
    HZL_isCat: 0,
    // 购物车的商品
    HZL_my_cat: [],
    // 购物车总价
    totalprice: 0,
    // 购物车的数量
    HZL_num: 0,
    //分类的数组
    HZL_categories: [
      '菜单',
      '评论',
      '商家'
    ],
    //swiper滑动的数组
    HZL_swiper_ID: 0,

    category: [],
    // 左 => 右联动 右scroll-into-view 所需的id
    HZL_toView: null,
    // 当前左侧选择的
    HZL_currentLeftSelect: 0,
    // 当前左侧选择的名称
    HZL_currentLeftSelectName: '',
    // 右侧每类数据到顶部的距离（用来与 右 => 左 联动时监听右侧滚动到顶部的距离比较）
    HZL_eachRightItemToTop: [],
    HZL_leftToTop: 0,
    lastid: 0,
    // 商品分类id
    tid: 0,
    bottomHeight: '70rpx',
    catHeight: '90rpx',
    rid: 0, //如果用户通过房间二维码进入的，当用户下单时，自动设置房间号
    roomno: 0, //用户所在房间号
    loadOptions: '',
    sid: 0,
    
  },

  //第二次扫码，如果用onload，获取不到二维码参数
  onShow: function () {
    
    var that = this;
    var options = this.data.loadOptions;
    console.log(options);
   
    var scene = options.scene;
    //如果用户通过房间二维码进入的，当用户下单时，自动设置房间号
    if (scene != '' && scene != undefined) {
      scene=decodeURIComponent(options.scene);
      scene = scene.split('*');
      this.setData({
        rid: scene[0],
        sid:scene[1]
      })
      that.beforeLoad();
    } else {
      let sid = options.sid; //商家id
      this.setData({
        sid: sid
      })
      this.beforeLoad();
    }
  },

  onLoad: function (options) {
    this.setData({
      loadOptions: options
    })
    var that = this;
    app.util.handleTabbar('');
    //高度大小
    wx.getSystemInfo({
      success: function (res) {
        let isPhone = app.globalData.isIphoneX;
        let bottomHeight;
        isPhone ? bottomHeight = 129 : bottomHeight = 100;
        var HZL_height = res.windowHeight - bottomHeight
        var HZL_height1 = res.windowHeight - bottomHeight
        that.setData({
          HZL_height: HZL_height,
          HZL_height1: HZL_height1
        })
      }
    });
    that.setData({
      HZL_eachRightItemToTop: this.HZL_getEachRightItemToTop()
    });

  },

  //判断初始化uid
  beforeLoad: function () {
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      app.userLogin().then(res => {
        this.getfirstdata();
      })
    } else {
      this.getfirstdata();
    }
  },

  // 初始化数据
  getfirstdata: function () {
    var that = this;
    var uniacid = app.siteInfo.uniacid;
    var tid = this.data.tid;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/orderingfood',
      data: {
        m: 'fy_jiu',
        lastid: 0,
        uniacid: uniacid,
        openid: openid,
        tid: tid,
        op: 'allData',
        kind: 1,
        sid: this.data.sid,
        rid:that.data.rid
      },
      cachetime: 0,
      success: function (res) {
        console.log(res);
        if (!res.data.errno) {
          var category = res.data.data.category;
          var carts = res.data.data.carts;
          var lists = res.data.data.lists;
          var totalnum = res.data.data.totalnum;
          var totalprice = res.data.data.totalprice;
          var tid = category[0].id;

          that.setData({
            category: category,
            lists: lists,
            tid: tid,
            HZL_currentLeftSelect: tid,
            HZL_currentLeftSelectName: category[0].name,
            HZL_my_cat: carts,
            mycart: carts,
            totalprice: totalprice,
            HZL_num: totalnum,
            title: res.data.data.title,
            roomno:res.data.data.roomno
          });
          wx.setNavigationBarTitle({
            title: res.data.data.title,
          })
        }
      }
    });
  },



 

  // 
  bindCheckout: function () {
    var that=this;
    // 初始化toastStr字符串
    var toastStr = '';
    var openid = wx.getStorageSync('openid');
    // 遍历取出已勾选的cid
    app.util.request({
      url: 'entry/wxapp/orderingfood',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        op: "getcartids",
        kind: '1',
        sid: this.data.sid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          var cartids = res.data.data.cartids;
          if (cartids) {
            console.log('lyj 购物车数据ids', cartids);
            wx.setStorageSync('cartids', cartids);
            if(that.data.roomno){
              wx.navigateTo({
                url: '../shoporder/pay?cartId=' + cartids + '&mode=1&kind=1&roomno='+that.data.roomno+'&sid='+this.data.sid
              })
            }else{
              wx.navigateTo({
                url: '../shoporder/pay?cartId=' + cartids + '&mode=1&kind=1'+'&sid='+this.data.sid,
              })
            }

          } else {
            if (cartids == '') {
              wx.showToast({
                title: '请先选择',
                duration: 2000
              });
              return false;
            }
          }
        }
      }
    });


    //存回data
    // wx.navigateTo({
    //   url: '../shoporder/pay?cartId=' + toastStr + '&mode=1',
    // })
  },
   //记录swiper滚动的
   HZL_swiperchange: function (e) {
    var that = this;
    that.setData({
      HZL_swiper_ID: e.detail.current,
    })
  },
  onShareAppMessage: function (res) {
    let sid = this.data.sid;
    return {
      title: this.data.title + '餐厅',
      path: '/fy_jiu/pages/orderingfood/orderingfood?sid=' + sid
    }
  },

  //点击分类栏
  HZL_categories: function (e) {
    var that = this;
    that.setData({
      HZL_swiper_ID: e.currentTarget.dataset.index
    })
  },

  // 获取每个右侧的 bar 到顶部的距离，用来做后面的计算。
  HZL_getEachRightItemToTop: function () {
    var obj = {};
    // var totop = 0;
    // // 右侧第一类肯定是到顶部的距离为 0
    // obj[lists[0].id] = totop
    // // 循环来计算每个子类到顶部的高度
    // for (let i = 1; i < (lists.length + 1); i++) {
    //   totop += (RIGHT_BAR_HEIGHT + lists[i - 1].category.length * RIGHT_ITEM_HEIGHT)
    //   // 这个的目的是 例如有两类，最后需要 0-1 1-2 2-3 的数据，所以需要一个不存在的 'last' 项，此项即为第一类加上第二类的高度。
    //   obj[lists[i] ? lists[i].id : 'last'] = totop
    // }
    return obj
  },


  // 监听右侧的滚动事件与 HZL_eachRightItemToTop 的循环作对比 从而判断当前可视区域为第几类，从而渲染左侧的对应类。
  right: function (e) {
    // for (let i = 0; i < this.data.constants.length; i++) {
    //   let left = this.data.HZL_eachRightItemToTop[this.data.constants[i].id]
    //   let right = this.data.HZL_eachRightItemToTop[this.data.constants[i + 1] ? this.data.constants[i + 1].id : 'last']
    //   if (e.detail.scrollTop < right && e.detail.scrollTop >= left) {
    //     this.setData({
    //       HZL_leftToTop: LEFT_ITEM_HEIGHT * i
    //     })
    //   }
    // }

    console.info('lyj 右侧滚动监听');
  },

  // 左侧类的点击事件，点击时，右侧会滚动到对应分类
  left: function (e) {
    let that = this;
    console.info('lyj 你点击了左侧菜单了', e.target.id);

    let tid = e.target.id || e.target.dataset.id;

    this.setData({
      tid: tid,
      HZL_currentLeftSelect: tid,
      HZL_toView: "idtop",
    });
  },


  //是否显示下面的购物车
  HZL_isCat: function (e) {
    var that = this;
    if (that.data.HZL_isCat == 0 && that.data.HZL_num > 0) {
      that.setData({
        HZL_isCat: 1
      })
    } else if (that.data.HZL_isCat == 1 && that.data.HZL_num > 0) {
      that.setData({
        HZL_isCat: 0
      })
    }
  },

  //关闭
  HZL_isCat_close: function (e) {
    this.setData({
      HZL_isCat: 0
    })
  },

  //清空
  HZL_zero: function (e) {
    let that = this;

    for (var i = 0; i < this.data.lists.length; i++) {
      if (this.data.lists[i] != null) {
        for (var j = 0; j < this.data.lists[i].length; j++) {
        
          console.log('222', this.data.lists[i][j]);
          console.log('222', this.data.lists[i][j].number);

          this.data.lists[i][j].number = 0;
        }
      }
    }

    let lists = this.data.lists;
    for (let val in lists) {
      for (let v in lists[val]) {
        console.log('遍历lists:', lists[val][v]);
        lists[val][v].number = 0;
      }

      // console.log('遍历:' + val);
    }


    this.setData({
      HZL_isCat: 0,
      HZL_num: 0,
      totalprice: 0,
      HZL_my_cat: [],
      lists: lists,
    });

    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/foodcart',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        op: 'del',
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {

        }
      }
    });
  },

  // 增加
  HZL_jia: function (e) {
    let that = this;
    console.info('lyj 点击加号');
    console.info('lyj 商品id', e.currentTarget.dataset.index);
    console.info('lyj tid', e.currentTarget.dataset.parentindex);

    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    var HZL_my_cat = this.HZL_my_jia(parentIndex, index)


    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      lists: that.data.lists,
    })
  },

  //减少
  HZL_jian: function (e) {
    let that = this;
    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    var HZL_my_cat = this.HZL_my_jian(parentIndex, index)

    if (this.data.HZL_num == 0) {
      this.data.HZL_isCat = 0;
    } else {
      this.data.HZL_isCat = 1;
    }

    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      lists: that.data.lists,
    })
  },

  // 下面购物车增加
  HZL_jia1: function (e) {
    console.info('lyj 购物车点击加号', e);
    console.info('lyj 商品id', e.currentTarget.dataset.index);

    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;


    var HZL_my_cat = this.HZL_my_jia(parentIndex, index)
    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      lists: this.data.lists,
    })
  },

  //下面购物车减少
  HZL_jian1: function (e) {
    let that = this;
    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    var HZL_my_cat = this.HZL_my_jian(parentIndex, index)

    if (this.data.HZL_num == 0) {
      this.data.HZL_isCat = 0;
    } else {
      this.data.HZL_isCat = 1;
    }

    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      lists: that.data.lists,
      HZL_isCat: that.data.HZL_isCat
    })
  },

  //封装加的方法
  HZL_my_jia: function (parentIndex, index) {
    console.log('lyj 封装加的方法');
    // 购物车数量
    this.data.HZL_num++;
    var index = index;
    var parentIndex = parentIndex;
    // 商品id
    var id = this.data.lists[parentIndex][index].id;
    // 商品名称
    var name = this.data.lists[parentIndex][index].name;
    // 商品数量
    var number = ++this.data.lists[parentIndex][index].number;
    // 商品价格
    var price = this.data.lists[parentIndex][index].mprice;
    // 商品合计
    var total = price * number;
    total = total.toFixed(2);

    var totalprice = this.data.totalprice;
    var temptotalprice = this.accAdd(price, totalprice);

    console.info('lyj 相加前 购物车总价:', totalprice);
    console.info('lyj 当前:', total);
    console.info('lyj 购物车总价', temptotalprice);

    this.setData({
      totalprice: temptotalprice
    })

    //弄一个元素判断会不会是重复的
    var mark = this.getmark(id, parentIndex);
    var obj = {
      id: id,
      number: number,
      name: name,
      mark: mark,
      price: price,
      total: total,
      index: index,
      parentIndex: parentIndex
    };

    this.addCart(id, 1);
    return this.push2cat(obj);
  },

  // getmark
  getmark: function (index, parentIndex) {
    return 'a' + index + 'b' + parentIndex + 'c' + '0' + 'd' + '0';
  },

  //封装减的方法
  HZL_my_jian: function (parentIndex, index) {
    this.data.HZL_num--;
    var index = index;
    var parentIndex = parentIndex;
    // 商品id
    var id = this.data.lists[parentIndex][index].id;
    // 商品名称
    var name = this.data.lists[parentIndex][index].name;
    // 商品数量
    var number = --this.data.lists[parentIndex][index].number;
    // 商品价格
    var price = this.data.lists[parentIndex][index].mprice;
    // 商品合计
    var total = price * number;
    total = total.toFixed(2);

    var totalprice = this.data.totalprice;

    console.info('lyj total:', total);
    console.info('lyj totalprice:', totalprice);

    var temptotalprice = this.accSub(totalprice, price);
    console.info('lyj 购物车总价', temptotalprice);

    this.setData({
      totalprice: temptotalprice
    })


    //弄一个元素判断会不会是重复的
    var mark = this.getmark(id, parentIndex);
    var obj = {
      id: id,
      number: number,
      name: name,
      mark: mark,
      total: total,
      index: index,
      parentIndex: parentIndex
    };

    this.bindMinus(id, number);

    return this.push2cat1(obj);
  },

  push2cat: function (obj) {
    var HZL_my_cat = this.data.HZL_my_cat;
    HZL_my_cat.push(obj)

    var arr = [];
    //去掉重复的
    for (var i = 0; i < HZL_my_cat.length; i++) {
      if (obj.mark == HZL_my_cat[i].mark) {
        HZL_my_cat.splice(i, 1, obj)
      }
      if (arr.indexOf(HZL_my_cat[i]) == -1) {
        arr.push(HZL_my_cat[i]);
      }
    }

    return arr
  },


  push2cat1: function (obj) {
    var HZL_my_cat = this.data.HZL_my_cat;
    HZL_my_cat.push(obj)

    var arr = [];
    //去掉重复的
    for (var i = 0; i < HZL_my_cat.length; i++) {
      if (obj.mark == HZL_my_cat[i].mark) {
        HZL_my_cat.splice(i, 1, obj)
      }
    }

    var arr1 = [];
    //当数量大于1的时候加
    for (var i = 0; i < HZL_my_cat.length; i++) {
      if (arr1.indexOf(HZL_my_cat[i]) == -1) {
        arr1.push(HZL_my_cat[i]);
        if (HZL_my_cat[i].number > 0) {
          arr.push(arr1[i])
        }
      }
    }

    return arr;
  },

  accAdd: function (arg1, arg2) {
    if (isNaN(arg1)) {
      arg1 = 0;
    }
    if (isNaN(arg2)) {
      arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);
    var r1, r2, m, c;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
      var cm = Math.pow(10, c);
      if (r1 > r2) {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", "")) * cm;
      } else {
        arg1 = Number(arg1.toString().replace(".", "")) * cm;
        arg2 = Number(arg2.toString().replace(".", ""));
      }
    } else {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
  },

  accSub: function (arg1, arg2) {
    if (isNaN(arg1)) {
      arg1 = 0;
    }
    if (isNaN(arg2)) {
      arg2 = 0;
    }
    arg1 = Number(arg1);
    arg2 = Number(arg2);

    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  },

  getTabbar: function () {
    var that = this;
    app.util.request({
      url: 'entry/wxapp/tabbar',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          that.setTabBar()
          wx.setStorageSync('barlist', res.data.data)

        }
      }
    });
  },


  tel: function () {
    var phone = this.data.blist.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  driver: function () {
    wx.openLocation({
      latitude: Number(this.data.blist.jing),
      longitude: Number(this.data.blist.wei),
      address: this.data.blist.address
    })
  },

  tabNav: function (event) {
    var url = event.currentTarget.dataset.url;
    if (url.indexOf('https')!='-1'){
      wx.setStorageSync('navurl', url)
      wx.navigateTo({
        url: '../webview/webview',
      })
    }else{
      wx.navigateTo({
        url: url,
      })
    }
  },

  // 添加到购物车
  addCart: function (pid, number) {
    var openid = wx.getStorageSync('openid');
    var that = this;
    app.util.request({
      url: 'entry/wxapp/foodcart',
      data: {
        m: 'fy_jiu',
        op: 'add',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        pid: pid,
        num: number,
        kind: 1,
        sid: this.data.sid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  getcartid: function (pid) {
    let that = this;

    let mycart = that.data.mycart;
    let cartid = 0;

    for (let index in mycart) {
      if (mycart[index].pid == pid) {
        cartid = mycart[index].id;
        break;
      }
    }

    return cartid;
  },

  // 减少购物车
  bindMinus: function (pid, number) {
    var that = this;

    var cart_id = that.getcartid(pid);
    var openid = wx.getStorageSync('openid');

    app.util.request({
      url: 'entry/wxapp/foodcart',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        op: 'minus',
        num: number,
        cartid: cart_id,
        pid: pid
      },
      cachetime: 0,
      success: function (res) {
        // if (!res.data.errno) {
        //   var carts = that.data.carts;
        //   that.setData({
        //     carts: carts
        //   })           
        // }
      }
    });



  },

  // 增加到购物车
  bindPlus: function (e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index].num;
    var pid = that.data.carts[index].pid;
    num++;
    var cart_id = e.currentTarget.dataset.cartid;
    var openid = wx.getStorageSync('openid');
    app.util.request({
      url: 'entry/wxapp/foodcart',
      data: {
        m: 'fy_jiu',
        uniacid: app.siteInfo.uniacid,
        openid: openid,
        op: 'plus',
        num: num,
        cartid: cart_id,
        pid: pid
      },
      cachetime: 0,
      success: function (res) {
        if (!res.data.errno) {
          var carts = that.data.carts;
          carts[index]['num'] = num;
          that.setData({
            carts: carts
          })
          that.sum();
        }
      }
    });
  },



})