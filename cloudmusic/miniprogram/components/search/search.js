// components/search/search.js
let keyword = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  externalClasses: ['iconfont', 'icon-sousuo'],
  /**
   * 组件的初始数据
   */
  data: {
    text:''
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event) {
      keyword = event.detail.value
    },
    onSearch() {
      this.triggerEvent('onSearch', {
        keyword,
      })
      this.setData({
        text:''
      })
    }
  }
})