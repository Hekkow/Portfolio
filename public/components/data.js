export const data = Vue.reactive({
    loadedUsers: new Map(),
    loadedConversations: new Map(),
    currentlyOnlineUsers: [],
    userID: -1,
    openConversationID: -1,
    editing: -1,
    replyingTo: -1,
    modals: {
        None: 'None',
        InviteToGroupChat: 'InviteToGroupChat',
        RenameGroupChat: 'RenameGroupChat',
        TransferGroupChat: 'TransferGroupChat',
        CreateGroupChat: 'CreateGroupChat',
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
        Location: "Location",
        Width: "Width",
        Height: "Height",
        Size: "Size",
        Rotation: "Rotation",
        Radius: "Radius",
        NumberPoints: "Number of Points",
        Inset: "Inset",
        ControlPoint: "Control Point"
    },
    mode: "Location",
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
        Censored: 'Censored',
        Theme: 'Theme'
    },
    openSettings: 'User',
    theme: new Map(),
    shapesDirty: false
})