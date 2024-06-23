import TestButton from './NTestButton.js'
import UserBlock from './UserBlock.js'
import UserList from "./UserList.js";
import {store} from './data.js'
export default {
    components: {
        'test-button': TestButton,
        'data': store,
        'user-block': UserBlock,
        'user-list': UserList,
    }
}