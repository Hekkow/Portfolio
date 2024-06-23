export default {
    template: `
        <button>
          {{ username }}
        </button>
    `,
    props: {
        username: {
            type: String,
            default: ''
        }
    }
}