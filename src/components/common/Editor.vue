<template>
  <div class="border rounded bg-white">
    <!-- 툴바 -->
    <div class="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <button @click="toggleBold" class="btn">B</button>
        <button @click="toggleItalic" class="btn">I</button>
      </div>

      <!-- 정렬 -->
      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <button @click="setAlign('left')" class="btn">⬅</button>
        <button @click="setAlign('center')" class="btn">⬆</button>
        <button @click="setAlign('right')" class="btn">➡</button>
        <button @click="setAlign('justify')" class="btn">⬌</button>
      </div>

      <!-- 링크 -->
      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <button @click="setLink" class="btn">🔗</button>
        <button @click="unsetLink" class="btn">❌</button>
      </div>
      <br />

      <!-- 색상 -->
      <div class="inline-flex rounded-md shadow-sm overflow-hidden">
        <input type="color" @input="onColorPick" />
        <button @click="unsetColor" class="btn">색상 제거</button>
      </div>
    </div>

    <!-- 에디터 -->
    <EditorContent :editor="editor" class="p-3 editor-wrapper" />
  </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import api from "@/lib/api";

export default {
  name: "TiptapEditor",
  components: { EditorContent },

  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      editor: null,
    };
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          link: false, // 반드시 비활성화
        }),

        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer",
          },
        }),

        Image,

        Placeholder.configure({
          placeholder: "내용을 입력하세요...",
        }),

        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),

        TextStyle,
        Color,
      ],

      content: this.modelValue,

      onUpdate: () => {
        this.$emit("update:modelValue", this.editor.getHTML());
      },
    });
  },

  beforeUnmount() {
    if (this.editor) this.editor.destroy();
  },

  watch: {
    modelValue(newValue) {
      if (this.editor && this.editor.getHTML() !== newValue) {
        this.editor.commands.setContent(newValue, false);
      }
    },
  },

  methods: {
    toggleBold() {
      this.editor.chain().focus().toggleBold().run();
    },

    toggleItalic() {
      this.editor.chain().focus().toggleItalic().run();
    },

    setAlign(align) {
      this.editor.chain().focus().setTextAlign(align).run();
    },

    // 🔥 링크 완전 수정 버전
    setLink() {
      const previousUrl = this.editor.getAttributes("link").href;
      const url = prompt("링크 주소 입력", previousUrl || "");

      if (url === null) return;

      // 빈 문자열이면 링크 제거
      if (url === "") {
        this.editor.chain().focus().unsetLink().run();
        return;
      }

      const { empty } = this.editor.state.selection;

      if (empty) {
        // 선택 없으면 텍스트 삽입
        this.editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}" target="_blank">${url}</a>`)
          .run();
      } else {
        // 선택 영역에 링크 적용
        this.editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    },

    unsetLink() {
      this.editor.chain().focus().unsetLink().run();
    },

    onColorPick(e) {
      this.editor.chain().focus().setColor(e.target.value).run();
    },

    unsetColor() {
      this.editor.chain().focus().unsetColor().run();
    },

    triggerImageUpload() {
      this.$refs.fileInput.click();
    },

    async handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/api/upload", formData);
        const imageUrl = res.data.url;

        this.editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (err) {
        console.error("이미지 업로드 실패", err);
      }

      e.target.value = "";
    },
  },
};
</script>

<style scoped>
.btn {
  @apply px-2 py-1 text-sm border rounded hover:bg-gray-200;
}

/* 🔥 입력 영역 기본 높이 문제 해결 */
.editor-wrapper :deep(.ProseMirror) {
  min-height: 250px;
  outline: none;
}
</style>
