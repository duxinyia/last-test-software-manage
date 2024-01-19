import { successResponseWrap, failResponseWrap } from '../mock'

export default [
  {
    url: '/mock/test/success',
    method: 'GET',
    response: () => {
      return successResponseWrap({'data|100':[{'id|+1':0,name:'@cname','age|20-30':1}]})
    }
  },
  {
    url: '/mock/test/fail',
    method: 'get',
    response: () => {
      return failResponseWrap(null, '请求出错了呦~', 400)
    }
  }
]
