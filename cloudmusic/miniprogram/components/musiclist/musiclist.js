// components/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingid: -1,
  },
  pageLifetimes: {
    show() {
      this.setData({
        playingid: parseInt(app.getMusicId())
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    select(event) {
      const ds = event.currentTarget.dataset
      const playingid = ds.musicid
      this.setData({
        playingid: playingid
      })
      wx.navigateTo({
        url: `../../pages/player/player?playingid=${playingid}&index=${ds.index}`,
      })
    }
  }
})