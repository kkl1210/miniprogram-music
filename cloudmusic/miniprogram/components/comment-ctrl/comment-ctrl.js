// components/comment-ctrl/comment-ctrl.js
const db = wx.cloud.database()
let content = ''
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogid: String,
    commentNum: Number,
    blog: Object,
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  /**
   * 组件的初始数据
   */
  data: {
    loginmodalShow: false,
    commentModalShow: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                console.log(res)
                userInfo = {
                  nickName: res.userInfo.nickName,
                  avatarUrl: res.userInfo.avatarUrl
                }
                this.onLoginSuccess()
              }
            })
          } else {
            console.log('未授权')
            this.setData({
              loginmodalShow: true
            })
          }
        }
      })
    },
    onLoginSuccess() {
      // console.log('已授权')
      this.setData({
        loginmodalShow: false
      }, () => {
        this.setData({
          commentModalShow: true
        })
      })
    },
    onLoginFail() {
      wx.showModal({
        title: '用户必须授权才能评论',
      })
    },
    onInput(event) {
      content = event.detail.value
    },
    send() {
      if (content.trim() == '') {
        wx.showModal({
          title: '评论不能为空',
        })
        return
      }
      wx.showLoading({
        title: '发布中...',
      })
      db.collection('blog-comment').add({
        data: {
          blogid: this.properties.blogid,
          content,
          createTime: db.serverDate(),
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          commentModalShow: false
        })
        this.triggerEvent('refreshCommentList')
      }).catch(err => {
        console.error(err)
      })
    },
  }
})