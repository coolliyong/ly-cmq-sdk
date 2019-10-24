const CMQClient = require('../index.js')

const cmq = new CMQClient({
  host: 'https://cmq-queue-bj.api.qcloud.com',
  Region: 'ap-beijing',
  SecretId: '',
  SecretKey: ''
})

// 获取队列
cmq.sendRequest('ListQueue', {})
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.error(err)
  })

// 发送消息到队列
// cmq
//   .sendMsgtoQueue({ queueName: 'pms_one_dev', msgBody: 'test_str_msg1' })
//   .then(res => {
//     console.log(`res:消息11`, res)
//   })
//   .catch(err => {
//     console.log(err)
//   })

// 批量发送消息到队列
// cmq
//   .batchSendMsgToQueue({
//     queueName: 'pms_one_dev',
//     msgBody: ['test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', { message: 'test_str_msg1' }]
//   })
//   .then(res => {
//     console.log(`res:发送消息`, res)
//   })
//   .catch(err => {
//     console.log(err)
//   })

// // 单条消费 CMQ消息
// cmq.queueMsgRecive({queueName:'pms_one_dev'}).then(res=>{
//   console.log(`收到一条消息:${res.msgBody}`)
// }).catch(err=>{
//   console.log(err)
// })

//  批量消费 CMQ消息
//  cmq.batchQueueMsgReceive({queueName:'pms_one_dev', numOfMsg:2}).then(res=>{
//    console.log(`批量接收2消息:${res}`)
// console.log(res)
// }).catch(err=>{
//   console.log(err)
// })
