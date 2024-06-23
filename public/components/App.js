import TestButton from './NTestButton.js'
import UserBlock from './UserBlock.js'
import UserList from "./UserList.js"
import {store} from './data.js'
import ProfilePic from "./ProfilePic.js"
// export default {
//     components: {
//         'test-button': TestButton,
//         'data': store,
//         'user-block': UserBlock,
//         'user-list': UserList,
//         'profile-pic': ProfilePic
//     }
// }
const app = Vue.createApp({});

app.component('test-button', TestButton)
app.component('user-block', UserBlock)
app.component('user-list', UserList)
app.component('profile-pic', ProfilePic)
app.component('data', store)
export default app