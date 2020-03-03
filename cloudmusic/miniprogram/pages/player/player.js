// pages/player/player.js
const app = getApp()
let musiclist = []
let playingIndex = ''
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, //当前是否正在播放
    showLyric: false,
    lyric: '',
    isSame: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    playingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this.loadMusicDetail(options.playingid)
  },
  showLyric() {
    this.setData({
      showLyric: !this.data.showLyric
    })
  },
  loadMusicDetail(musicId) {
    if (musicId == app.getMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if (!this.data.isSame) {
      backgroundAudioManager.stop()
    }
    app.setMusicId(musicId)
    let music = musiclist[playingIndex]
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl
    })
    wx.showLoading({
      title: '歌曲加载中...',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then(res => {
      const result = JSON.parse(res.result)
      if (result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if (!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
      }
      this.setData({
        isPlaying: true
      })
      this.saveHistory()
      wx.hideLoading()

      //加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric',
        }
      }).then(res => {
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if (lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })

    })
  },
  toggleMusic() {
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  onPre() {
    playingIndex--
    if (playingIndex < 0) {
      playingIndex = musiclist.length - 1
    }
    console.log(musiclist[playingIndex].id)
    this.loadMusicDetail(musiclist[playingIndex].id)
  },
  onNext() {
    playingIndex++
    if (playingIndex > musiclist.length) {
      playingIndex = 0
    }
    this.loadMusicDetail(musiclist[playingIndex].id)
  },
  timeUpdate(event) {
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  onPlay() {
    this.setData({
      isPlaying: true
    })
  },
  onPause() {
    this.setData({
      isPlaying: false
    })
  },
  saveHistory() {
    const music = musiclist[playingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let inHistory = false
    for (let i = 0, len = history.length; i < len; i++) {
      if (history[i].id == music.id) {
        inHistory = true
        break
      }
    }
    if (!inHistory) {
      history.unshift(music)
      wx.setStorageSync(openid, history)
    }

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