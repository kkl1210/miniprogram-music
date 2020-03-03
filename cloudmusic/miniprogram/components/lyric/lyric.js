// components/lyric/lyric.js
let lyricHeight = 0
let preIndex = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showLyric: {
      type: Boolean,
      value: false,
    },
    lyric: {
      type: String,
      value: ''
    }
  },
  lifetimes: {
    ready() {
      //所有屏幕的宽度都规定为750rpx
      wx.getSystemInfo({
        success: function(res) {
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },
  observers: {
    lyric(lyc) {
      if (lyc === '暂无歌词') {
        this.setData({
          lyriclist: [{
            lyc,
            time: 0,
          }],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lyc)
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    lyriclist: [],
    nowLyricIndex: 0,

    scrollTop: 0,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _parseLyric(slyric) {
      let _lyrics = []
      let line = slyric.split('\n')
      line.forEach((item) => {
        let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time) {
          let lyc = item.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          let sec = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3] / 1000)
          _lyrics.push({
            lyc,
            time: sec
          })
        }
      })
      this.setData({
        lyriclist: _lyrics
      })
    },
    update(currentTime) {
      const lyriclist = this.data.lyriclist
      if (lyriclist.length === 0) {
        return
      }
      if (currentTime > lyriclist[lyriclist.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lyriclist.length * lyricHeight
          })
        }
      }
      for (let i = 0, len = lyriclist.length; i < len; i++) {
        if (currentTime <= lyriclist[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
          })
          if (preIndex !== this.data.nowLyricIndex) {
            this.setData({
              scrollTop: (i - 1) * lyricHeight
            })
          }
          preIndex = this.data.nowLyricIndex
          break
        }
      }
    }

  }
})