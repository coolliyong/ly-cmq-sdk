# CMQSDK

nodejs 操作 cmq  
[点击查看腾讯云 cmqapi 文档](https://cloud.tencent.com/document/api/406/5852)

## 已经实现的方法
- createQueue 创建队列
- sendMsgtoQueue 发送消息到队列
- batchSendMsgToQueue 批量发送消息到队列
- createTopic 创建主题
- sendMsgtoTopic 发送消息到主题
- batchSendMsgToTopic 批量发送消息到主题
- queueMsgRecive 从队列消费消息
- batchQueueMsgReceive 从队列批量消费消息

// 有很多没有实现的 api 接口 一样可以调用

```js
// https://cloud.tencent.com/document/api/406/5852
// 获取队列列表
// arg1:操作ID
// optts 参数,根据api参数 自行传入
cmq.sendRequest('ListQueue', {})
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.error(err)
  })
```

## 创建实例

```js
const cmq = new CMQClient({
  host: 'https://cmq-queue-bj.api.qcloud.com',
  Region: 'ap-beijing',
  SecretId: '',
  SecretKey: ''
})
```

## 发送消息到队列

```js
cmq
  .sendMsgtoQueue({ queueName: 'pms_one_dev', msgBody: 'test_str_msg1' })
  .then(res => {
    console.log(`res:消息11`, res)
  })
  .catch(err => {
    console.log(err)
  })
```

## 批量发送消息到队列

数据可以是字符串，也可以是`JSON`|`Array`

```js
// 批量发送消息到队列
cmq
  .batchSendMsgToQueue({
    queueName: 'pms_one_dev',
    msgBody: ['test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', 'test_str_msg1', { message: 'test_str_msg1' }]
  })
  .then(res => {
    console.log(`res:发送消息`, res)
  })
  .catch(err => {
    console.log(err)
  })
```

````
## 单条消费 队列 消息
```js
cmq.queueMsgRecive({queueName:'pms_one_dev'}).then(res=>{
console.log(`收到一条消息:${res.msgBody}`)
}).catch(err=>{
console.log(err)
})
````

## 批量消费队列 信息

```js
cmq
  .batchQueueMsgReceive({ queueName: 'pms_one_dev', numOfMsg: 2 })
  .then(res => {
    console.log(`批量接收2消息:${res}`)
    console.log(res)
  })
  .catch(err => {
    console.log(err)
  })
```

## 获取队列

```js
cmq
  .sendRequest('ListQueue', {})
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.error(err)
  })
```
