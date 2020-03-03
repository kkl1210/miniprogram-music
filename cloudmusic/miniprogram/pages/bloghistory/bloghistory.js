// pages/bloghistory/bloghistory.js
const db = wx.cloud.database()
const MAX_LIMIT = 10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    history: []
  },
  getBlogHistory() {
    wx.showLoading({
      title: '加载中...',
    })
    db.collection('blog').skip(this.data.history.length).limit(MAX_LIMIT).orderBy('createTime', 'desc').get().then(res => {
      let bloglist = res.data
      for (let i = 0, len = bloglist.length; i < len; i++) {
        bloglist[i].createTime = bloglist[i].createTime.toString()
      }
      this.setData({
        history: this.data.history.concat(bloglist)
      })
      wx.hideLoading()
    })
  },
  onComment(event) {
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getBlogHistory()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

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
    this.getBlogHistory()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})