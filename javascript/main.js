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
        role: "teacher",
        email: "test1@gmail.com",
        // Main page data.
        currentPage: "lesson",
        // My lesson page.
        lessons: [
            {
                id: 1,
                name: 'Math Basics',
                description: 'Introductory math lesson',
                subject: 'Math',
                location: 'Room 101',
                space: 20,
                price: 500,
                students: [
                    { email: "test1@gmail.com" },
                    { email: "test2@gmail.com" },
                    { email: "test3@gmail.com" },
                    { email: "test4@gmail.com" },
                    { email: "test5@gmail.com" },
                    { email: "test6@gmail.com" }
                ]
            }
        ],
        lessonForm: {
            name: '',
            description: '',
            subject: '',
            location: '',
            space: '',
            price: ''
        },
        errors: {
            name: '',
            description: '',
            subject: '',
            location: '',
            space: '',
            price: ''
        },
        isEditing: false,
        showLessonForm: false,
        studentPage: 1
    },
    methods: {
        setPage(page) {
            this.currentPage = page
        },
        toggleDarkMode(event) {
            if (event.target.checked) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        },
        openAddLesson() {
            this.resetForm();
            this.isEditing = false;
            this.showLessonForm = true
        },
        validateField(field) {
            const value = this.lessonForm[field];

            switch (field) {
                case 'name':
                case 'description':
                case 'subject':
                case 'location':
                    if (value === "") {
                        this.errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
                    } else {
                        this.errors[field] = "";
                    }
                    break;
                case 'space':
                    if (value === "") {
                        this.errors.space = "Space is required.";
                    } else if (isNaN(value)) {
                        this.errors.space = "Must be a number.";
                    } else if (value < 1) {
                        this.errors.price = "Space cannot be less than 1.";
                    } else {
                        this.errors.space = "";
                    }
                    break;
                case 'price':
                    if (value === "") {
                        this.errors.price = "Price is required.";
                    } else if (isNaN(value)) {
                        this.errors.price = "Must be a number.";
                    } else if (value < 0) {
                        this.errors.price = "Price cannot be less than zero.";
                    } else {
                        this.errors.price = "";
                    }
                    break;
            }
        },
        resetForm() {
            this.lessonForm = {
                id: null,
                name: '',
                description: '',
                subject: '',
                location: '',
                space: '',
                price: ''
            };
            this.errors = {
                name: '',
                description: '',
                subject: '',
                location: '',
                space: '',
                price: ''
            }
            this.isEditing = false;
        },
        submitLesson() {
            Object.keys(this.lessonForm).forEach(
                field => this.validateField(field)
            );
            const hasError = Object.values(this.errors).some(e => e !== '');
            if (hasError) {
                return;
            };
            this.resetForm();
        },
        editLesson(lesson) {
            this.resetForm();
            this.lessonForm = { ...lesson };
            this.isEditing = true;
            this.showLessonForm = true
        },
        deleteLesson(lesson) {
            const index = this.lessons.findIndex(l => l.id === lesson.id);
            if (index !== -1) {
                this.lessons.splice(index, 1);
            }
            if (this.lessonForm.id === lesson.id) {
                this.resetForm();
                this.isEditing = false;
            }
        },
        cancelEdit() {
            this.resetForm();
            this.isEditing = false;
            this.showLessonForm = false;
        },
        nextPage() {
            const total = this.lessonForm.students.length;
            const maxPage = Math.ceil(total / 5);
            if (this.studentPage < maxPage) {
                this.studentPage++;
            }
        },
        prevPage() {
            if (this.studentPage > 1) {
                this.studentPage--;
            }
        },
        removeStudent(student) {
            this.lessonForm.students = this.lessonForm.students.filter(s => s.email !== student.email);
        },
        removeStudentFromLesson(lesson) {
            lesson.students = lesson.students.filter(s => s.email !== this.userEmail);
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
            const sidebarLeft = sidebar.offsetLeft;

            sidebar.style.top = headerHeight + 'px';

            if (window.innerWidth > 768) {
                sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
                mainContent.style.marginTop = headerHeight + 'px';
                mainContent.style.marginLeft = sidebarLeft + 'px';
            } else {
                sidebar.style.height = 'auto';
                mainContent.style.marginTop = headerHeight + sidebarHeight + 'px';
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
        },
        paginatedStudents() {
            const start = (this.studentPage - 1) * 5;
            return this.lessonForm.students.slice(start, start + 5);
        },
        enrolledLessons() {
            return this.lessons.filter(lesson =>
                lesson.students.some(student => student.email === this.email)
            );
        },
        hasMorePages() {
            return this.lessonForm.students.length > this.studentPage * 5;
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