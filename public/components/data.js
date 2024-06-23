export const store = Vue.reactive({
    count: 0,
    loadedUsers: new Map(),
    currentlyOnlineUsers: [],
    increment() {
        this.count++
    }
})