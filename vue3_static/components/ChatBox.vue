<template>
  <div>
    <div class="chat_output" v-html="memory.html"></div>
    <textarea class="chat_input row" style="width: 100%;" v-model="memory.message"></textarea>
    <button v-on:click="send">Send</button>
    <select v-model="memory.selected_model">
      <option
        v-for="(m, i) in memory.models"
        :value="i"
      >{{ m }}</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'ChatBox',
  props: {
    chat: {
      type: Function,
      required: true,
    },
    memory: {
      type: Object,
      required: true,
    },
    markdown: {
      required: true,
    },
  },

  data() {
    return {
    };
  },

  methods: {
    send() {
      const self = this;
      let input = this.memory.message+"";

      self.memory.message = "";
      let md = self.markdown.makeHtml(input);
      self.memory.html += '<div><b>user:</b> ' + md + '</div>';

      self.chat(input, self.memory.history, self.memory.models[self.memory.selected_model], function (h) {
        self.memory.history.splice(0, self.memory.history.length, ...h);
        self.memory.html = "";

        for (let i = 0; i < self.memory.history.length; i++) {
          let line = self.memory.history[i];
          let md = self.markdown.makeHtml(line.content);
          self.memory.html += "<div><b>" + line.role + ":</b> " + md + "</div>";
        }
        const output_box = self.$el.querySelector('.chat_output');
        output_box.children[output_box.children.length-1].scrollIntoView();
      });
    },
  }
}
</script>

<style scoped>
.chat_output {
    width: 100%;
    height: 600px;
    border: 1px solid grey;
    overflow: scroll;
}
</style>
