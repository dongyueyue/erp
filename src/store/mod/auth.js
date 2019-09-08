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
        wx.getUserInfo({
            success(res){
                context.commit('setUser',res)
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
