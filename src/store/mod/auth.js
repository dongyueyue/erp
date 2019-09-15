
const userType = {
    'UNUSERSET':0, //未授权
    'USERSETSUCCESS':1, //已授权
    'USERSETFAIL':2, //授权失败
    'LOGIN':3, //已登录
}

const state = {
    user:null,
    type:0
}
const getters = {

}

const mutations = {
    setUser(state,user){
        state.user = user;
    }
}

const actions = {
    initUser(context){
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success (res) {
                            context.commit('setUser',res.rawData)
                        }
                    })
                }
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
