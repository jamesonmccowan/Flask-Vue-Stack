<template>
  <div
    class="tabs"
    @drop="onDrop($event, tabs)"
  >
    <div
      v-for="(t, i) in tabs.list"
      :class="{'tab': true, 'selected': i === tabs.selected}"
      @click="selectWrapper(t, i)"
      @dblclick="startTitleEdit(t, i)"
      :key="i"
      :draggable="!t.edit"
      @dragstart="startDrag($event, i)"
      @dragover.prevent="dragOver($event, i)"
      @dragenter.prevent
    >
      <input
        class="title-input"
        type="text"
        v-if="t.edit"
        v-model="t.title"
        @keyup.enter="t.edit = false"
        @keyup.escape="t.edit = false"
        @blur="t.edit = false"
        autofocus
      >
      <span class="title" v-if="!t.edit">
        {{ (typeof t.title === 'undefined') ? '[Unnamed]' : t.title }}
      </span>
      <button
        class="close-tab-button"
        @click.stop="removeWrapper(t, i)"
      >X</button>
    </div>
    <div
      class="tab new-tab-button"
      v-show="typeof create === 'function'"
      @click.stop="createWrapper()"
      @dragover.prevent="dragOver($event, tabs.list.length)"
    ><button class="close-tab-button">+</button></div>
  </div>
</template>


<script>
export default {
  name: 'Tabs',
  props: {
    create: {
      type: Function,
      required: false,
    },
    remove: {
      type: Function,
      required: false,
    },
    select: {
      type: Function,
      required: true,
    },
    tabs: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      over: 0,
    };
  },

  methods: {
    createWrapper() {
      if (typeof this.create === 'function') {
        const n = this.create();
        this.tabs.list.splice(this.tabs.selected+1, 0, n);
      }
    },
    removeWrapper(t, i) {
      if (typeof this.remove === 'function') {
        this.remove(t, i);
      }
      if (i < this.tabs.selected) {
        this.tabs.selected--;
      }
      if (this.tabs.selected >= this.tabs.list.length - 1) {
        this.selectWrapper(t, 0);
      }
      this.tabs.list.splice(i, 1);
    },
    selectWrapper(t, i) {
      if (i < this.tabs.list.length && i >= 0) {
        if (typeof this.select === 'function') {
          this.select(t, i);
        }
        this.tabs.selected = i;
      }
    },
    startTitleEdit(t, i) {
      t.edit = !t.edit;
      if (t.edit) {
        const self = this;

        // delay until element has been rendered
        setTimeout(function () {
          self.$el.querySelector(".title-input")?.focus();
        }, 10);
      }
    },
    startDrag(evt, index) {
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.effectAllowed = 'move'
      evt.dataTransfer.setData('tabIndex', index)
    },
    dragOver(evt, index) {
      this.over = index;
    },
    onDrop(evt, tabs) {
      let src = evt.dataTransfer.getData('tabIndex')
      let dst = this.over;
      this.over = -1;

      if (dst > -1 && dst <= this.tabs.list.length
      && src > -1 && src <= this.tabs.list.length) {
        const tab = this.tabs.list[src];
        this.selectWrapper(tab, src);

        // remove tab
        this.tabs.list.splice(src, 1);
        if (dst > src) {
          dst--;
        }

        // add tab back in new place
        this.tabs.list.splice(dst, 0, tab);

        this.tabs.selected = dst;
      }
    },
  }
}
</script>

<style scoped>
.tabs {
  border-bottom: 1px solid black;
  background-color: #eee;
  padding-top: 3px;
}
.tab {
  border: 1px solid #333;
  border-bottom-width: 0px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: #eee;
  color: #333;
  display: inline-block;
  padding: 0px 3px;
}
.tab.selected {
  background-color: #fff;
  color: #000;
}
.close-tab-button {
  font-size: 8pt;
}
.new-tab-button {
}
</style>
