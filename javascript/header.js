new Vue({
    el: 'header',
    data: {
        isSignin: true,
    },
    methods: {
        openAuthForm() {
            const authContainer = document.getElementById('auth');
            authContainer.style.display = 'flex';
        }
    }
})

const toggle = document.getElementById('toggleDarkMode');

toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
});