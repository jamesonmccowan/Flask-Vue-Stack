<template>
  <div class="monaco-editor">
    <div class="monaco-editor-container"></div>
    (press Ctrl+shift+/ for <button class="suggest">Code Suggestions</button>)
    <select v-model="memory.selected_model">
      <option
        v-for="(m, i) in memory.models"
        :value="i"
      >{{ m }}</option>
    </select>
    <label>Language:
      <select v-model="memory.language" v-on:change="changeLanguage">
        <option
          v-for="(m, i) in languages"
          :value="m.id"
        >{{ m.id }}</option>
      </select>
    </label>
  </div>
</template>

<script>
export default {
  name: 'CodeEditor',

  props: {
    suggest: {
      type: Function,
      required: true,
    },
    monaco: {
      type: Object,
      required: true,
    },
    memory: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      // ​monaco.languages.getLanguages() returns an array with each element containing the following:
      /* {
        "aliases": [ "Plain Text", "text" ],
        "extensions": [ ".txt" ],
        "id": "plaintext",
        "mimetypes": [ "text/plain" ]
      } */
      // "aliases" isn't always present
      languages: this.monaco.languages.getLanguages()
    };
  },

  methods: {
    getValue() {
      this.memory.editor.trigger('', 'code-get');
      return this.memory.code;
    },
    setValue(text) {
      this.memory.code = text;
      this.memory.editor.trigger('', 'code-set');
    },
    changeLanguage() {
      this.memory.editor.trigger('', 'change-language');
    },
  },

  // https://stackoverflow.com/questions/38086013/get-the-value-of-monaco-editor
  mounted() {
    const self = this;
    const editor = this.monaco.editor.create(
      this.$el.querySelector('.monaco-editor-container'),
      {
        value: this.memory.code,
        language: this.memory.language
      }
    );

    this.memory.vue = this;
    this.memory.editor = editor;

    editor.addAction({
      // An unique identifier of the contributed action.
      id: "code-suggest",

      // A label of the action that will be presented to the user.
      label: "Code Suggestion",

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyMod.WinCtrl | monaco.KeyMod.Shift | monaco.KeyCode.Slash,
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Slash,
      ],

      // A precondition for this action.
      precondition: null,

      // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
      keybindingContext: null,
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,

      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run: function (ed) {
        let model = ed.getModel();
        const position = ed.getPosition();

        let textBeforeCursor = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        let textAfterCursor = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: model.getLineCount(),
          endColumn: model.getLineMaxColumn(model.getLineCount())
        });

        // console.log('Text before cursor: ', textBeforeCursor);
        // console.log('Text after cursor: ', textAfterCursor);

        // get code suggestion
        self.suggest(textBeforeCursor, textAfterCursor, self.memory.models[self.memory.selected_model], function (suggestion) {
          // Apply the edit to insert the text
          ed.executeEdits("insertText", [{
            range: new self.monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: suggestion,
            forceMoveMarkers: true
          }]);
        });
      },
    });
    this.$el.querySelector('.suggest').addEventListener("click", function(e) {
      editor.trigger('', 'code-suggest');
    }, false);

    editor.addAction({
      id: "code-get",
      label: "Code Get",
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: function (ed) {
        let model = ed.getModel();
        self.memory.code = model.getValue();
      },
    });

    editor.addAction({
      id: "code-set",
      label: "Code Set",
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: function (ed) {
        let model = ed.getModel();
        model.setValue(self.memory.code);
      },
    });

    editor.addAction({
      id: "change-language",
      label: "Change Language",
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: function (ed) {
        self.monaco.editor.setModelLanguage(ed.getModel(), self.memory.language);
      },
    });

    return true;
  },
}
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 600px;
  border: 1px solid grey;
}
</style>
