/*
 * @Author: liyonglong
 * @Date: 2019-10-24 10:14:46
 * @Last Modified by: liyonglong
 * @Last Modified time: 2019-10-24 10:49:46
 */

const crypto = require('crypto')

class Sign {
  // 签名
  // GET + host + params
  _signature(host, SecretKey, apiPath, allParams) {
    // 排序keys
    const paramsStr = this._sortKeys(allParams)
    const _host = host.replace(/(https|http):\/\//, '')

    // 加密原文
    const originStr = 'GET' + _host + apiPath + paramsStr
    // SHA 256加密 设置秘钥
    let signer = crypto.createHmac('SHA256', SecretKey)
    // 加密
    signer.update(originStr)
    // base64 编码
    const encode = signer.digest('base64')
    // console.log(`加密前:${originStr}`)
    // console.log(`加密后:${encode}`)
    allParams['Signature'] = encode
  }

  // 对 对象 进行排序 并返回排序后的字符串
  _sortKeys(obj) {
    // 删除
    const _obj = Object.assign({}, obj)
    // 删除秘钥
    // delete _obj.SecretKey
    let keys = Object.keys(_obj)
    keys = keys.sort()
    let paramsStr = ''
    keys.forEach((v, k) => {
      if (k === 0) {
        paramsStr += `?${v}=${obj[v]}`
      } else {
        paramsStr += `&${v}=${obj[v]}`
      }
    })
    return paramsStr
  }
}

module.exports = new Sign()
