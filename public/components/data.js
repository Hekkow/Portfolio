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
        BlockedUsers: 'BlockedUsers'
    },
    openModal: 'None',
    createGroupChatUsers: [],
    shapes: new Map(),
    userPopupID: -1,
    typingConversations: new Map(),
    read: new Map(),

})