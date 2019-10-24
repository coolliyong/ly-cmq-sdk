/*
 * @Author: liyonglong
 * @Date: 2019-10-24 10:15:31
 * @Last Modified by: liyonglong
 * @Last Modified time: 2019-10-24 11:15:15
 */

const querystring = require('querystring')
const https = require('https')
const sign = require('./sign.js')

const apiPath = '/v2/index.php'

class CMQClient {
  constructor(opts = {}) {
    const { host, Region, SecretId, SecretKey } = opts
    // console.info(`cmq api 文档: https://cloud.tencent.com/document/api/406/5852`)
    this.host = host
    this.SecretKey = SecretKey
    this.commonOpts = {
      Region: Region,
      SecretId,
      SignatureMethod: 'HmacSHA256'
    }
  }

  /**
   * 创建队列
   *
   * @param {{queueName:String}} [opt] 队列配置项 https://cloud.tencent.com/document/product/406/5832
   * @returns Promise
   *
   */
  async createQueue(opts = { queueName: '' }) {
    const { queueName } = opts
    if (!queueName) {
      return { code: -1, message: 'queueName name 不能为空' }
    }
    return await this.sendRequest('CreateQueue', opts)
  }

  /**
   * 发送消息 到队列
   *
   * @param {{queueName:string,msgBody:string|Object}} opts 配置 https://cloud.tencent.com/document/product/406/5837
   * @returns
   */
  sendMsgtoQueue(opts = {}) {
    const { queueName, msgBody } = opts
    if (!msgBody || !queueName) {
      return Promise.reject({ code: -1, message: 'queueName || msg 不能为空' })
    }
    opts['msgBody'] = this._objectToString(msgBody)
    return this.sendRequest('SendMessage', opts)
  }

  /**
   * 批量发送消息到队列
   * @param {{queueName:String,msgBody:Array,delaySeconds:Number}} [opts={}]
   * @returns
   * @memberof CMQClient
   */
  batchSendMsgToQueue(opts = {}) {
    const self = this
    const { queueName, msgBody = [] } = opts
    if (!queueName) {
      return Promise.reject({ code: -1, message: 'queueName 不能为空' })
    }
    if (!msgBody || !Array.isArray(msgBody)) {
      return Promise.reject({ code: -1, message: 'msgBody 必须是数组格式' })
    }
    if (msgBody.length <= 0) {
      return Promise.reject({ code: -1, message: 'msgBody 不能为空' })
    }
    const msgList = {}
    msgBody.forEach((v, k) => {
      const key = `msgBody.${k}`
      msgList[key] = self._objectToString(v)
    })
    delete opts.msgBody
    return this.sendRequest('BatchSendMessage', { ...msgList, ...opts })
  }

  /**
   * 创建主题
   * @param {{topicName:String,maxMsgSize:Number,filterType:1|2}} [opt={}]
   * @returns
   * @memberof CMQClient
   */
  createTopic(opt = {}) {
    const { topicName } = opt
    if (!topicName) {
      return Promise.reject({ code: -1, message: 'topicName 不能为空' })
    }
    return this.sendRequest('CreateTopic', opts)
  }

  /**
   * 发送消息 到 主题
   * @param {{topicName:String, msgBody:String|Object, routingKey:String, msgTag:String}} 主题名字 https://cloud.tencent.com/document/product/406/7411
   * @returns
   */

  sendMsgtoTopic(opts = {}) {
    const { topicName, msgBody, routingKey } = opts
    if (!msgBody || !topicName || !routingKey) {
      return Promise.reject({ code: -1, message: 'topicName || msg || routingKey 不能为空' })
    }
    opts['msgBody'] = this._objectToString(msgBody)
    return this.sendRequest('PublishMessage', opts)
  }

  /**
   * 批量发送消息到主题
   * @param {{topicName:String, msgBody:Array, routingKey:String}} opts https://cloud.tencent.com/document/product/406/7412
   */
  batchSendMsgToTopic(opts = {}) {
    const self = this
    const { topicName, msgBody = [], msgTag = [], routingKey } = opts
    if (!topicName || !routingKey) {
      return Promise.reject({ code: -1, message: 'topicName || routingKey 不能为空' })
    }
    if (!msgBody || !Array.isArray(msgBody)) {
      return Promise.reject({ code: -1, message: 'msgBody 必须是数组格式' })
    }
    if ((msgBody.length = 0)) {
      return Promise.reject({ code: -1, message: 'msgBody 不能为空' })
    }

    const msgListStr = {}
    msgBody.forEach((v, k) => {
      const key = `&msgBody.${k}`
      msgListStr[key] = self._objectToString(v)
    })
    delete opts.msgBody
    let msgTagStr = {}

    // 如果 有tags 则添加进tags
    let _opts = { ...msgListStr, ...opts }
    if (msgTag.length > 0) {
      msgTag.forEach((v, k) => {
        const key = `&msgTag.${k}`
        msgTagStr[key] = self._objectToString(v)
      })
      _opts = { ...msgListStr, ...opts, ...msgTagStr }
    }

    return this.sendRequest('BatchPublishMessage', _opts)
  }

  /**
   * 单条消费队列消息
   * @param {{queueName:String,pollingWaitSeconds:Number}} [opts={}]
   * @memberof CMQClient
   */
  queueMsgRecive(opts = {}) {
    if (!opts.queueName) {
      return Promise.reject({ code: -1, message: 'queueName 不能为空' })
    }
    return this.sendRequest('ReceiveMessage', opts)
  }

  /**
   *
   * 批量消费队列消息
   * @param {{queueName:String,numOfMsg:Number,pollingWaitSeconds:Number}} [opts={}]
   * @memberof CMQClient
   */
  batchQueueMsgReceive(opts = {}) {
    const { queueName, numOfMsg } = opts
    if (!queueName || !numOfMsg) {
      return Promise.reject({ code: -1, message: 'queueName || numOfMsg 不能为空' })
    }
    return this.sendRequest('BatchReceiveMessage', opts)
  }

  /**
   * 请求 - 内部调用，外部也可以调用，传入 ACTION 和 Action 参数
   * @param {String} action Action 动作
   * @param {Object} params 参数
   * @returns
   * @memberof CMQClient
   */
  sendRequest(action, params) {
    const self = this
    return new Promise((resolve, reject) => {
      // 设置
      const _commonOpts = self.commonOpts
      // 设置时间戳和随机数
      self.setCommonParams(_commonOpts)

      const allParams = {
        Action: action,
        ...self.commonOpts,
        ...params
      }
      const _url = self.host + apiPath
      // 参数加密
      sign._signature(self.host, self.SecretKey, apiPath, allParams)
      const cmqApiUrl = _url + '?' + querystring.stringify(allParams)
      let resStream = ''
      const req = https.request(cmqApiUrl, pip => {
        if (pip.statusCode !== 200) {
          resolve()
        }
        pip.on('data', d => {
          resStream += d
        })

        pip.on('end', () => {
          try {
            const _resJons = JSON.parse(resStream)
            if (_resJons.code + '' !== 0) {
              resolve(_resJons)
            } else {
              reject(_resJons)
            }
          } catch (error) {
            console.warn(`cmq api response body json parse fail`)
            reject({ messsage: 'cmq api response body json parse fail', status: -1 })
          }
          // resolve(resdata)
        })
      })
      req.on('error', e => {
        console.error(e)
        reject(e)
      })
      req.end()
    })
  }

  // 修改公共参数 添加时间戳，随机数
  setCommonParams(commonOpts) {
    commonOpts['Nonce'] = Math.round(Math.random() * Math.pow(10, 5))
    commonOpts['Timestamp'] = Math.round(new Date().getTime() / 1000)
  }

  // 检测消息体是否是对象，如果是对象，格式化成字符串
  _objectToString(param) {
    if (typeof param === 'object' || param !== null) {
      return JSON.stringify(param)
    }
    return param
  }
}

module.exports = CMQClient
