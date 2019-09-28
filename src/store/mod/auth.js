
//const userType = {
//    'UNUSERSET':0, //未授权
//    'USERSETSUCCESS':1, //已授权
//    'USERSETFAIL':2, //授权失败
//    'LOGIN':3, //已登录
//}
import config from './authConfig';
import request from '../../common/request';
const loginType = config.loginType
const authorizeType = config.authorizeType
const state = {
    user:{},
    authorize:authorizeType.UNAUTHORIZE,
    loginType:loginType.UNLOGIN,
    loaded:false
}
const getters = {

}

const mutations = {
    setUser(state,user){

        state.user = {
            name:user.name,
            avatar:user.avatar,
            token:user.token,
            ksid:user.ksid
        };
    },
    setAuthorize(state,type){
        state.authorize = type
    },
    setLoginType(state,type){
        state.loginType = type
    },
    setLoaded(state,type){
        state.loaded = type
    }

}

const actions = {
    initWXUser(context,loginData){
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success (res) {
                            if(res.errMsg=="getUserInfo:ok"){
                                context.commit('setUser',{
                                    name:res.userInfo.nickName,
                                    avatar:res.userInfo.avatarUrl,
                                    token:'',
                                    ksid:''
                                })
                                context.commit('setAuthorize',authorizeType.SUCCESS)
                                context.dispatch('checkUser',{
                                    code:loginData.code,
                                    iv:res.iv,
                                    encryptedData:res.encryptedData
                                })
                            }else{
                                context.commit('setAuthorize',authorizeType.UNAUTHORIZE)
                            }
                            context.commit('setLoaded',true)
                        }
                    })
                }else{
                    context.commit('setAuthorize',authorizeType.UNAUTHORIZE)
                    context.commit('setLoaded',true)
                }
            }
        })
    },
    initLogin(context){
        wx.login({
            success:function(res){
                if(res.code){
                    context.dispatch('initWXUser',res)
                }else{
                    context.commit('setAuthorize',authorizeType.UNAUTHORIZE)
                }
            }
        })
    },
    checkUser(context,params){
        request.api({
            "service": "WechatMini.CheckUser",
            "code": params.code,
            "iv": params.iv,
            "encryptedData": params.encryptedData
        }).then(function(res){
            var data = res.data.data
            if(data.code==0){
                context.commit('setUser',{
                    name:data.info.nickname,
                    avatar:data.info.avatar,
                    ksid:data.info.ksid,
                    unionid:data.info.wx_unionid,
                    openid:data.info.wx_openid,
                    token:'',
                    phone:''
                })
                context.dispatch('serverLoginByWX',{unionid:data.info.wx_unionid})
            }else if(data.code ==  137){
                context.commit('setUser',{
                    name:data.info.nickname,
                    avatar:data.info.avatar,
                    ksid:data.info.ksid,
                    unionid:data.info.wx_unionid,
                    openid:data.info.wx_openid,
                    token:'',
                    phone:''
                })
                context.commit('setLoginType',loginType.HALF)
            }else{
                context.commit('setLoginType',loginType.UNLOGIN)
            }
        })
    },
    serverLoginByWX(context,params){
        request.api({
            "service": "WechatMini.MiniLogin",
            "unionid": params.unionid
        }).then(function(res){
            var data = res.data.data
            if(data.code == 0){
                context.commit('setUser',{
                    name:data.info.nickname,
                    avatar:data.info.avatar,
                    token:data.info.token,
                    ksid:data.info.ksid,
                    unionid:data.info.wx_unionid,
                    openid:data.info.wx_openid,
                    phone:data.info.phone
                })
                context.commit('setLoginType',loginType.LOGIN)
            }else{
                context.commit('setLoginType',loginType.UNLOGIN)
            }
        })
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
