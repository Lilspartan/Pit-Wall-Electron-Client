module.exports = {
    darkMode: 'class', // or 'media' or 'class'
    content: [
        './renderer/Pages/**/*.{js,jsx,ts,tsx}',
        './renderer/Components/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'dark-card-handle': '#222222ff',
                'dark-card-body': '#222222aa',
                'light-card-handle': '#eeeeeeff',
                'light-card-body': '#eeeeeeaa',
                'dark-card': '#222222',
                'light-card': '#eeeeee',
                'twitter-brand': '#00acee',
                'github-brand': '#6e5494',
                'gmail-brand': '#DB4437',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
