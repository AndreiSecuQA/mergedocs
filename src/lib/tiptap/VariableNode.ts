import { Node, mergeAttributes, CommandProps } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      /**
       * Insert a variable node at the current cursor position.
       */
      insertVariable: (name: string) => ReturnType
    }
  }
}

export const VariableNode = Node.create({
  name: 'variable',

  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-variable'),
        renderHTML: (attributes) => ({
          'data-variable': attributes.name,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { 'data-variable': name, ...rest } = HTMLAttributes
    return [
      'span',
      mergeAttributes(rest, {
        'data-variable': name,
        class: 'variable-chip',
        contenteditable: 'false',
      }),
      `$${name}`,
    ]
  },

  addCommands() {
    return {
      insertVariable:
        (name: string) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: { name },
          })
        },
    }
  },
})
