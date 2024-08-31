export const data = Vue.reactive({
    loadedUsers: new Map(),
    loadedConversations: new Map(),
    currentlyOnlineUsers: [],
    userID: -1,
    openConversationID: -1,
    editing: -1,
    replyingTo: -1,
    profilePictureOpen: false,
    modals: {
        None: 'None',
        InviteToGroupChat: 'InviteToGroupChat',
        RenameGroupChat: 'RenameGroupChat',
        TransferGroupChat: 'TransferGroupChat',
        CreateGroupChat: 'CreateGroupChat',
        BlockedUsers: 'BlockedUsers',
        Settings: 'Settings',
        Loading: 'Loading'
    },
    openModal: 'None',
    usersCheckbox: [],
    userRadio: -1,
    shapes: new Map(),
    userPopupID: -1,
    typingConversations: new Map(),
    read: new Map(),
    Modes: {
        Move: 0,
        Width: 1,
        Height: 2,
        Size: 3,
        Rotation: 4,
        Radius: 5,
    },
    mode: 0,
    focusMessageInput: false,
    popups: {
        None: 'None',
        Blocked: 'Blocked',
        LongMessage: 'LongMessage'
    },
    openPopup: 'None',
    activateCensor: -1,
    settingsTabs: {
        User: 'User',
        ProfilePic: 'ProfilePic',
        Chats: 'Chats',
        Blocked: 'Blocked',
        Censored: 'Censored'
    },
    openSettings: 'User'
})