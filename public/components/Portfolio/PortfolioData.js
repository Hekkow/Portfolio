export const data = Vue.reactive({
    openApps: new Set(),
    allApps: new Set(),
    desktopApps: new Map(),
    latestDesktopID: 0,
    appOrder: [],
    startMenuOpen: false,
    openImage: null,
})