const markdown = new showdown.Converter();
const loadModule = window['vue3-sfc-loader'].loadModule;

const moduleOptions = {
  moduleCache: {
    vue: Vue,
  },
  getFile(url) {
    return fetch(url).then((resp) =>
      resp.ok ? resp.text() : Promise.reject(resp)
    );
  },
  addStyle(styleStr) {
    const style = document.createElement('style');
    style.textContent = styleStr;
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  log(type, ...args) {
    console.log(type, ...args);
  },
};

require.config({ paths: { 'vs': '/static/lib/monaco-editor/min/vs' }});
require(['vs/editor/editor.main'], function() {
  const app = Vue.createApp({
    data() {
      return {
	      markdown,
        chats: {
          list: [this.chatCreate()],
          selected: 0,
        },
        monaco,
        codeMemory: {
          code: "function () {\n}",
          language: "javascript",
          editor: {},
          models: [
            "codellama:7b-code",
            "deepseek-coder:6.7b-base-q8_0",
            "deepseek-coder:6.7b-instruct-q8_0",
            "codestral",
          ],
          selected_model: 0,
        },
        codes: {
          list: [this.codeCreate()],
          selected: 0,
        },
      };
    },
    components: {
      Tabs: Vue.defineAsyncComponent(() =>
        loadModule('/static/components/Tabs.vue', moduleOptions)
      ),
      ChatBox: Vue.defineAsyncComponent(() =>
        loadModule('/static/components/ChatBox.vue', moduleOptions)
      ),
      CodeEditor: Vue.defineAsyncComponent(() =>
        loadModule('/static/components/CodeEditor.vue', moduleOptions)
      ),
    },
    methods: {
      suggest(textBeforeCursor, textAfterCursor, model, callback) {
        $.ajax({
          url: '/code_suggest',
          type: 'POST',
          data: JSON.stringify({ 'prefix': textBeforeCursor, 'suffix': textAfterCursor, 'model': model, }),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function(response) {
            console.log(response);
            callback(response.response.middle);
          },
          error: function(xhr, status, error) {
            console.log('Error: ' + error.message);
          }
        });
      },
      chatSelect(t, i) {
      },
      chatCreate() {
        return {
          "title": "New Chat",
          "history": [],
          "html": "",
          "message": "",
          "models": [
            "wizard-vicuna-uncensored",
            "llama2",
            "llama3",
            "mixtral",
            "deepseek-coder:6.7b-instruct-q8_0",
            "codellama:7b-instruct",
            "phind-codellama:34b-v2-q2_K",
            "brxce/stable-diffusion-prompt-generator",
          ],
          "selected_model": 0,
        };
      },
      chatRemove(t, i) {
      },
      chat(message, history, model, callback) {
        $.ajax({
          url: '/chat',
          type: 'POST',
          data: JSON.stringify({ 'prompt': message, 'history': history, 'model': model, }),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: async function(response) {
            console.log(response);
            callback(response.response.history);
          },
          error: function(xhr, status, error) {
            console.log('Error: ' + error.message);
          }
        });
      },
      codeSelect(t, i) {
        // get current code
        let text = this.codeMemory.vue.getValue();

        // save current code
        this.codes.list[this.codes.selected].code = text;

        // set new code
        this.codeMemory.code = this.codes.list[i].code;
        this.codeMemory.vue.setValue(
          this.codeMemory.code
        );
      },
      codeCreate() {
        return {
          "title": "New Code",
          "code": "function () {\n}",
          "language": "javascript",
        };
      },
      codeRemove(t, i) {
      },
    }
  }).mount('#app');
});
