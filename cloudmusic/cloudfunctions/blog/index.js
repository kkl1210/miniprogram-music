// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()
const db = cloud.database()
const blogCollection = cloud.database().collection('blog')
const commentCollection = cloud.database().collection('blog-comment')
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRouter({
    event
  })
  app.router('blog-card', async(ctx, next) => {
    let keyword = event.keyword
    let w = {}
    if (keyword.trim() != '') {
      w = {
        textcontent: db.RegExp({
          regexp: keyword,
          options: 'i',
        })
      }
    }
    ctx.body = await blogCollection
      .where(w)
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  })
  app.router('detail', async(ctx, next) => {
    const blogId = event.blogId
    //获取详情
    let detail = await blogCollection.where({
      _id: blogId,
    }).orderBy('createTime', 'desc').get().then(res => {
      return res
    })
    //获取评论
    const countResult = await commentCollection.count()
    const total = countResult.total
    const times = Math.ceil(total / MAX_LIMIT)
    const task = []
    for (let i = 0; i < times; i++) {
      const promise = await commentCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
        blogid: blogId,
      }).orderBy('createTime', 'desc').get()
      task.push(promise)
    }
    let list = {
      data: []
    }
    if (task.length > 0) {
      list = (await Promise.all(task)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data)
        }
      })
    }
    ctx.body = {
      detail,
      list
    }
  })
  return app.serve()
}