// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(event) {
      console.log(event)
      const userInfo = event.detail.userInfo
      if (userInfo) {
        this.triggerEvent('loginSuccess', userInfo)
      } else {
        wx.showModal({
          title: '用户授权才能发布',
          content: '',
        })
        this.triggerEvent('loginFail')
      }
    }
  }
})
