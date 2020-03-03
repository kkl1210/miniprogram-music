// pages/blog-comment/blog-comment.js
import formatTime from '../../utils/formatTime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogId: '',
    blogDetail: {},
    commentList: [],
    commentNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      blogId: options.blogId
    })
    this._loaddetail()
  },
  _loaddetail() {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        blogId: this.data.blogId,
        $url: 'detail',
      }
    }).then(res => {
      let list = res.result.list.data
      for (let i = 0, len = list.length; i < len; i++) {
        list[i].createTime = formatTime(new Date(list[i].createTime))
      }
      this.setData({
        blogDetail: res.result.detail.data[0],
        commentList: list,
        commentNum: list.length,
      })
      console.log(this.data.commentList)
      wx.hideLoading()
    })
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
    let blog = event.target.dataset.blog
    return {
      title: '好友从柚子的木函给你分享一条消息~',
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})