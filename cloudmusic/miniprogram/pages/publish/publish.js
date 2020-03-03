// pages/publish/publish.js
const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9
const db = wx.cloud.database()
let userInfo = {}
let textcontent = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: '',
    footerbottom: 0,
    imgUrlList: [],
    showSelect: true,
  },
  onInput(event) {
    let content = event.detail.value
    if (content.length >= MAX_WORDS_NUM) {
      this.setData({
        wordsNum: `最多不能超过${MAX_WORDS_NUM}字`
      })
    }
    textcontent = content
  },
  onFocus(event) {
    this.setData({
      footerbottom: event.detail.height,
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  onDelete(event) {
    const index = event.target.dataset.index
    this.data.imgUrlList.splice(index, 1)
    this.setData({
      imgUrlList: this.data.imgUrlList
    })
    const max = MAX_IMG_NUM - this.data.imgUrlList.length
    if (max === 1) {
      this.setData({
        showSelect: true
      })
    }
  },
  onSelect() {
    const max = MAX_IMG_NUM - this.data.imgUrlList.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          imgUrlList: this.data.imgUrlList.concat(res.tempFilePaths)
        })
        const max = MAX_IMG_NUM - this.data.imgUrlList.length
        if (max <= 0) {
          this.setData({
            showSelect: false
          })
        }
      },
    })
  },
  onPublish() {
    if (textcontent.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask: true,
    })
    let promiseArr = []
    let fileIds = []
    for (let i = 0, len = this.data.imgUrlList.length; i < len; i++) {
      let item = this.data.imgUrlList[i]
      const suffix = /\.\w+$/.exec(item)[0]
      let p = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    Promise.all(promiseArr).then(res => {
      db.collection('blog').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          ...userInfo,
          imgs: fileIds,
          createTime: db.serverDate(),
          textcontent
        }
      })
        .then(res => {
          wx.hideLoading()
          wx.showToast({
            title: '发布成功',
          })
          wx.navigateBack()
          const pages = getCurrentPages()
          pages[pages.length - 2].onPullDownRefresh()
        })
        .catch(err => {
          wx.showToast({
            title: '发布失败',
          })
        })
    })
  },
  preImg(event) {
    const ds = event.target.dataset
    wx.previewImage({
      urls: ds.imgs,
      current: ds.current
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    userInfo = options
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})