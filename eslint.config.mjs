import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
    {
        ignores: ['node_modules', '.nuxt', '.husky', '*/.md'],
        rules: {
            // error rule
            'no-console': 'error',
            'vue/v-slot-style': 'error',
            'vue/v-on-style': 'error',
            'vue/prop-name-casing': 'error',

            // off rule
            'vue/multi-word-component-names': 'off',
            'vue/html-indent': 'off',
            'vue/html-self-closing': 'off',
            'vue/return-in-computed-property': 'off',
            '@typescript-eslint/no-dynamic-delete': 'off',
        },
    },
])
