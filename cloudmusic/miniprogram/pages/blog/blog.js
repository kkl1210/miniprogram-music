// pages/blog/blog.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
    blogList: [],
    keyword: ''
  },
  publish() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              console.log(res)
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },
  onLoginSuccess(event) {
    const detail = event.detail
    this.setData({
      modalShow: false
    })
    wx.navigateTo({
      url: `../publish/publish?nickName=${detail.nickName}&&avatarUrl=${detail.avatarUrl}`,
    })
  },
  onLoginFail(event) {
    console.log(event)
  },
  _loadBlogCard(start = 0) {
    wx.showLoading({
      title: 'Loading...',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword: this.data.keyword,
        start,
        count: 10,
        $url: 'blog-card',
      }
    }).then(res => {
      this.setData({
        blogList: this.data.blogList.concat(res.result.data)
      })
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  },
  onComment(event) {
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
    })
  },
  onSearch(event) {
    this.setData({
      blogList: []
    })
    this.data.keyword = event.detail.keyword
    this._loadBlogCard(0)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    this.data.blogList = []
    this.data.keyword = ''
    this._loadBlogCard()
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
    this.data.blogList = []
    this._loadBlogCard(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._loadBlogCard(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(event) {
    let blog = event.target.dataset.blog
    console.log(blog)
    return {
      title: '好友从柚子的木函给你分享一条消息~',
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})