new Vue({
    el: '#auth',
    data: {
        currentForm: 'login',
        email: '',
        password: '',
        confirmPassword: ''
    },
    computed: {
        headerTitle() {
            if (this.currentForm === 'login') return 'Hello, again';
            if (this.currentForm === 'signup') return 'Create Account';
            if (this.currentForm === 'reset') return 'Reset Password';
        },
        headerSubtitle() {
            if (this.currentForm === 'login') return 'We are happy to have you back.';
            if (this.currentForm === 'signup') return 'Join us and start learning.';
            if (this.currentForm === 'reset') return 'Enter your email to reset your password.';
        },
        leftTitle() {
            if (this.currentForm === 'login') return 'Be Ready to Learn.';
            if (this.currentForm === 'signup') return 'Start Your Journey.';
            if (this.currentForm === 'reset') return 'Forgot Password?';
        },
        leftSlogan() {
            if (this.currentForm === 'login') return 'Learn Anything, Anytime.';
            if (this.currentForm === 'signup') return 'Sign up and unlock knowledge.';
            if (this.currentForm === 'reset') return 'We will help you recover your account.';
        },
        actionText() {
            if (this.currentForm === 'login') return 'Login';
            if (this.currentForm === 'signup') return 'Sign Up';
            if (this.currentForm === 'reset') return 'Reset';
        }

    },
    methods: {
        switchForm(formName) {
            this.currentForm = formName;

            const header = document.getElementById('header');
            header.style.display = (formName === 'login' || formName === 'signup' || formName === 'reset') ? 'none' : 'flex';
        },
        submitAction() {
        }
    }
});
