const testurl = 'http://api-test.17epk.com/Wechat/';
const host = 'https://api.epk.kingsmith.com.cn/Wechat/'
export default {
    request:function(params){
        return new Promise((resolve,reject)=>{
            const success = params.success;
            const fail = params.fail
            params.success = function(res){
                success&&success(res);
                resolve(res)
            }
            params.fail = function(res){
                fail&&fail(res);
                reject(res)
            }
            wx.request(params)

        })
    },
    api:function(params){
        return this.request({
            url: host,
            data: params,
            method:'post',
            header: {
                'content-type': 'application/json' // 默认值
            }
        })
    }
}
