// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 10

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'


// 云函数入口函数
exports.main = async(event, context) => {
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const times = Math.ceil(total / MAX_LIMIT)
  const task = []
  for (let i = 0; i < times; i++) {
    const promise = await playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
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
  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  }).catch(err => {
    console.error(err)
  });
  const newList = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      newList.push(playlist[i])
    }
  }


  for (let i = 0, len = newList.length; i < len; i++) {
    await playlistCollection.add({
      data: {
        ...newList[i],
        createTime: db.serverDate()
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch(err => {
      console.error('插入失败')
    })
  }
  return newList.length
}