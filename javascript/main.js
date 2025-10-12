new Vue({
    el: '#app',
    data: {
        // Sidebar data.
        showFilters: false,
        sortAttribute: '',
        sortOrder: 'asc',
        isSmallScreen: window.innerWidth < 768,
        sortOptions: [],
        // Auth data.
        currentForm: 'login',
        email: '',
        password: '',
        confirmPassword: '',
        isSignin: false,
        // Main page data.
        currentPage: "lesson"
    },
    methods: {
        setPage(page){
            this.currentPage = page
        },
        toggleDarkMode(event) {
            if (event.target.checked) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        },
        openAuthForm() {
            this.currentForm = 'login';
            this.currentPage = 'login';
        },
        handleAuthBack() {
            if (this.currentForm === 'login') {
                this.currentPage = 'home';
                this.$nextTick(() => {
                    this.adjustMainLayout();
                });
            } else if (this.currentForm === 'signup') {
                this.currentForm = 'login';
            } else if (this.currentForm === 'reset') {
                this.currentForm = 'login';
            }
        },
        switchForm(formName) {
            this.currentForm = formName;
        },
        submitAction() {
        },
        toggleFilters() {
            this.showFilters = !this.showFilters;
        },
        adjustMainLayout() {
            const header = document.getElementById('header');
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');

            if (!header || !sidebar || !mainContent) {
                return;
            }
            
            const headerHeight = header.offsetHeight;
            const sidebarHeight = sidebar.offsetHeight;

            sidebar.style.top = headerHeight + 'px';

            if (window.innerWidth > 768) {
                sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
                mainContent.style.marginTop  = headerHeight + 'px';
            } else {
                sidebar.style.height = 'auto';
                mainContent.style.marginTop  = headerHeight + sidebarHeight + 'px';
            }
        },
        handleResize() {
            this.isSmallScreen = window.innerWidth < 768
            this.adjustMainLayout();

            if (!this.isSmallScreen) {
                this.showFilters = true;
            } else {
                this.showFilters = false;
            }
        },
        loadSortOptions() {
            const textOptions = [
                { value: 'subject', text: 'Subject' },
                { value: 'location', text: 'Location' },
                { value: 'price', text: 'Price' },
                { value: 'spaces', text: 'Spaces' }
            ]

            this.sortOptions = textOptions;
            if (textOptions.length > 0) {
                this.sortAttribute = textOptions[0].value;
            }
        }
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
    mounted() {
        this.adjustMainLayout();
        window.addEventListener('resize', this.handleResize);
        this.loadSortOptions();
    },
    created() {
        this.isSmallScreen = window.innerWidth < 768

        if (!this.isSmallScreen) {
            this.showFilters = true;
        }
    }
})