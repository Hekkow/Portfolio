import {data} from "./data.js";
export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <div class='messageDiv'>
<!--        <profile-pic :size=50 :userid="message.userID" :shapes="user.shapes"></profile-pic>-->
        <div class='messageTextDiv'>
          <p class='messageText'>{{ getDisplayableMessage(message) }}</p>
        </div>
      </div>
    `,
    methods: {
        getDisplayableMessage(message) {
            if (data.loadedUsers.get(data.userID).blocked.includes(message.userID)) return "Message from blocked user"
            let name = message.userID
            if (name) name = data.loadedUsers.get(name).username
            return name + ": " + this.addLinks(message.message)
        },
        addLinks(text) {
            let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&\/=]*)/g
            let match;
            let indices = [];
            while ((match = pattern.exec(text)) !== null) {
                indices.push({match: match[0], index: match.index});
            }
            for (let i = indices.length - 1; i >= 0; i--) {
                let url = indices[i].match;
                if (!(url.startsWith('http://') || url.startsWith('https://'))) url = 'https://' + url;
                let extension = url.split('.').pop().toLowerCase()
                let start = indices[i].index;
                let end = start + indices[i].match.length;
                if (['mp4', 'flv', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) {
                    text = text.slice(0, end) + '</a>' + text.slice(end);
                    text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
                    text += `<video controls><source src=${url} type="video/${extension}"></video>`
                } else if (['jpeg', 'jpg', 'gif', 'png', 'avif', 'svg'].includes(extension)) {
                    text = text.slice(0, end) + '</a>' + text.slice(end);
                    text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
                    text += `<img alt="" src="${url}">`
                } else {
                    text = text.slice(0, end) + '</a>' + text.slice(end);
                    text = text.slice(0, start) + `<a target='_blank' href='${url}'>` + text.slice(start);
                }

            }
            return text;
        }
    },
    props: {
        message: {
            type: Object
        }
    }
}