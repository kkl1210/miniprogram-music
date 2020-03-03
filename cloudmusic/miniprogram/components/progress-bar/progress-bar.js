// components/progress-bar/progress-bar.js
let moveableAreaWidth = 0
let moveableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //当前秒数
let duration = 0
let isMoving = false


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean,
  },
  lifetimes: {
    ready() {
      this._getMoveableDis()
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,
    progress: 0,

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      if (event.detail.source === 'touch') {
        this.data.progress = event.detail.x / (moveableAreaWidth - moveableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }

    },
    onEnd() {
      const currentTime = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTime.min + ':' + currentTime.sec
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },

    _getMoveableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        moveableAreaWidth = rect[0].width
        moveableViewWidth = rect[1].width
      })
      this._bindBGMEvent()
    },
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        isMoving = false
        this.triggerEvent('onPlay')
      })
      backgroundAudioManager.onStop(() => {

      })
      backgroundAudioManager.onPause(() => {
        this.triggerEvent('onPause')
      })
      backgroundAudioManager.onWaiting(() => {

      })
      backgroundAudioManager.onCanplay(() => {
        if (typeof backgroundAudioManager.duration !== 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          duration = backgroundAudioManager.duration
          const currentTimeFmt = this._dateFormat(currentTime)
          const sec = currentTime.toString().split('.')[0]
          if (currentSec !== sec) {
            this.setData({
              movableDis: (moveableAreaWidth - moveableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
          }
          currentSec = sec
          this.triggerEvent('timeUpdate',{
            currentTime,
          })
        }
      })
      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('autoNext')
      })
      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: 'errot' + res.errMsg,
        })
      })
    },
    _setTime() {
      const durationFmt = this._dateFormat(backgroundAudioManager.duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dateFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})