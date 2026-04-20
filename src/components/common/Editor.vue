<template>
  <div class="border rounded bg-white">
    <div class="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <button @click="toggleBold" class="btn">B</button>
        <button @click="toggleItalic" class="btn">I</button>
      </div>

      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <button @click="setAlign('left')" class="btn">⬅</button>
        <button @click="setAlign('center')" class="btn">⬆</button>
        <button @click="setAlign('right')" class="btn">➡</button>
        <button @click="setAlign('justify')" class="btn">⬌</button>
      </div>

      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <button @click="setLink" class="btn">🔗</button>
        <button @click="unsetLink" class="btn">❌</button>
      </div>
      <br />

      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <input type="color" @input="onColorPick" />
        <button @click="unsetColor" class="btn">색상 제거</button>
      </div>
    </div>

    <EditorContent :editor="editor" class="p-3 editor-wrapper" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

interface Props {
  modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
});

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const editor = shallowRef<Editor | null>(null);

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({ link: false } as any),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image,
      Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ],
    content: props.modelValue,
    onUpdate: () => {
      if (editor.value) emit("update:modelValue", editor.value.getHTML());
    },
  });
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue, false);
    }
  },
);

function toggleBold() {
  editor.value?.chain().focus().toggleBold().run();
}

function toggleItalic() {
  editor.value?.chain().focus().toggleItalic().run();
}

function setAlign(align: string) {
  editor.value?.chain().focus().setTextAlign(align).run();
}

function setLink() {
  const previousUrl = editor.value?.getAttributes("link").href;
  const url = prompt("링크 주소 입력", previousUrl || "");

  if (url === null) return;
  if (url === "") {
    editor.value?.chain().focus().unsetLink().run();
    return;
  }

  const { empty } = editor.value!.state.selection;

  if (empty) {
    editor.value!
      .chain()
      .focus()
      .insertContent(`<a href="${url}" target="_blank">${url}</a>`)
      .run();
  } else {
    editor.value!
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }
}

function unsetLink() {
  editor.value?.chain().focus().unsetLink().run();
}

function onColorPick(e: Event) {
  editor.value?.chain().focus().setColor((e.target as HTMLInputElement).value).run();
}

function unsetColor() {
  editor.value?.chain().focus().unsetColor().run();
}
</script>

<style scoped>
.btn {
  @apply px-2 py-1 text-sm border rounded hover:bg-gray-200;
}

.editor-wrapper :deep(.ProseMirror) {
  min-height: 250px;
  outline: none;
}
</style>
