import config from './authConfig';
import request from '../../common/request';
const loginType = config.loginType
const authorizeType = config.authorizeType
const state = {
    user:{},
    wxmsg:{},
    authorize:authorizeType.UNAUTHORIZE,
    loginType:loginType.UNLOGIN,
    loaded:false
}
const getters = {

}

const mutations = {
    setWxMsg(state,data){
        state.wxmsg = data
    },
    setUser(state,user){
        if(!user.name){
            user.name = state.user.name
        }
        if(!user.avatar){
            user.avatar = state.user.avatar
        }
        state.user = user;
    },
    setServerDataInUser(state,data){
        let newUser = {
            name:data.info.nickname,
            avatar:data.info.avatar,
            token:data.info.token,
            ksid:data.info.ksid,
            unionid:data.info.wx_unionid,
            openid:data.info.wx_openid,
            phone:data.info.phone
        }
        if(!newUser.name){
            newUser.name = state.user.name
        }
        if(!newUser.avatar){
            newUser.avatar = state.user.avatar
        }

        state.user = newUser
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
    getWXUserInfo(context,cb){
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success (res) {
                            if(res.errMsg=="getUserInfo:ok"){
                                let userData = {
                                    name:res.userInfo.nickName,
                                    avatar:res.userInfo.avatarUrl,
                                }

                                context.commit('setWxMsg',userData)
                                context.commit('setAuthorize',authorizeType.SUCCESS)
                                cb&&cb(res)
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
    linkCheckUser(context,callback){
        wx.login({
            success:function(loginData){
                if(loginData.code){
                    context.dispatch('getWXUserInfo',function(res){
                        context.dispatch('checkUser',{
                            params:{
                                code:loginData.code,
                                iv:res.iv,
                                encryptedData:res.encryptedData
                            },
                            cb:function(data){
                                callback&&callback(data)

                            }
                        })
                    })
                }else{
                    context.commit('setAuthorize',authorizeType.UNAUTHORIZE)
                }
            },
            fail:function(res){
                console.log(res)
            }
        })

    },
    initLogin(context){
        console.log(context)
        if(context.state.loginType == loginType.LOGIN || context.state.loginType == loginType.HALF){
            return false;
        }
        context.dispatch('linkCheckUser',function(data){
            if(data.code==0){
                context.dispatch('serverLoginByWX',{unionid:data.info.wx_unionid})
            }
        })
    },
    checkUser(context,option){
        request.api({
            "service": "WechatMini.CheckUser",
            "code": option.params.code,
            "iv": option.params.iv,
            "encryptedData": option.params.encryptedData
        }).then(function(res){
            var data = res.data.data
            option.cb&&option.cb(data)
        })
    },
    serverLoginByWX(context,params){
        request.api({
            "service": "WechatMini.MiniLogin",
            "unionid": params.unionid
        }).then(function(res){
            var data = res.data.data
            if(data.code == 0){
                context.commit('setServerDataInUser',data)
                context.commit('setLoginType',loginType.LOGIN)
            }else if(data.code ==  137){
                context.commit('setServerDataInUser',data)
                context.commit('setLoginType',loginType.HALF)
            }else{
                context.commit('setLoginType',loginType.UNLOGIN)
            }
        })
    },
    authorizeFaillToUN(context){
        if(context.state.authorize == authorizeType.FAIL){
            context.commit('setAuthorize',authorizeType.UNAUTHORIZE)
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
