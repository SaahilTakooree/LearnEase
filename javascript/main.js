new Vue({
    el: '#app',
    data: {        
        // API base URL.
        base_url: "http://localhost:6969",
        
        currentUserEmail: "",
        currentPage: "login",

        // Sidebar data.
        showFilters: false,
        sortAttribute: '',
        sortOrder: 'asc',
        isSmallScreen: window.innerWidth < 768,
        sortOptions: [],

        // Auth data.
        currentForm: 'login',
        email: "",
        password: "",
        confirmPassword: "",
        isAuth: false,
        authErrors:{
            email : "",
            password : "",
            confirmPassword : ""
        },

        // Main page data.
        lessons: [],

        // My lesson page.
        taughtLessons: [],
        enrolledLesson: [],
        lessonForm: {
            name: '',
            description: '',
            topic: '',
            location: '',
            space: '',
            price: '',
            student: [],
        },
        errors: {
            name: '',
            description: '',
            topic: '',
            location: '',
            space: '',
            price: ''
        },
        isEditing: false,
        showLessonForm: false,
        studentPage: 1,

        // Shopping cart.
        cart: [],
        checkoutName: "",
        checkoutPhone: "",
        isNameValid: false,
        isPhoneValid: false,
        isFormValid: false,
        orderSubmitted: false,
    },
    methods: {
        toggleCartPage() {
            // Check if the user is trying to access "shoppingCart" page without sign up.
            if (!this.isAuth) {
                // Show a pop-up warning.
                this.showPopUp({
                    message: "You need to login first to access this page.",
                    autoClose: 1000,
                    type: "warning"
                }).then(() => {
                    // Redirect to login page
                    this.currentForm = 'login';
                    this.currentPage = 'login';
                });
                return;
            }

            if (this.currentPage === 'shoppingCart') {
                this.currentPage = 'home';
            } else if (this.cart.length > 0) {
                this.currentPage = 'shoppingCart';
            }
        },
        openAddLesson() {
            this.resetForm();
            this.isEditing = false;
            this.showLessonForm = true
        },
        resetForm() {
            this.lessonForm = {
                id: null,
                name: '',
                description: '',
                topic: '',
                location: '',
                space: '',
                price: ''
            };
            this.errors = {
                name: '',
                description: '',
                topic: '',
                location: '',
                space: '',
                price: ''
            }
            this.isEditing = false;
        },
        submitLesson() {
            Object.keys(this.lessonForm).forEach(
                field => this.validateLessonField(field)
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
            this.showPopUp({ autoClose: 2000, type: "warning"});
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
            // Clear form & errors on success.
            this.clearAuthFormFields()
            this.clearAuthFormSpan();

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
            // Clear form & errors on success.
            this.clearAuthFormFields();
            this.clearAuthFormSpan();

            this.currentForm = formName;
        },
        submitAction() {
            if (this.currentForm === "signup") {
                this.signup()
            } else if (this.currentForm === "login") {
                this.login()
            } if (this.currentForm === "reset") {
                this.reset()
            }
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
                { value: 'topic', text: 'Topic' },
                { value: 'location', text: 'Location' },
                { value: 'price', text: 'Price' },
                { value: 'spaces', text: 'Spaces' }
            ]

            this.sortOptions = textOptions;
            if (textOptions.length > 0) {
                this.sortAttribute = textOptions[0].value;
            }
        },
        addToCart(lesson) {
            const item = this.cart.find(c => c.lessonId === lesson.id);
            if (!item) {
                this.cart.push({ lessonId: lesson.id, quantity: 1 });
            }
        },
        increaseQuantity(lesson) {
            const remaining = lesson.availableSpace;
            if (remaining > 0) {
                const item = this.cart.find(c => c.lessonId === lesson.id);
                if (item) {
                    item.quantity++;
                }
            }
        },
        decreaseQuantity(lesson) {
            const item = this.cart.find(c => c.lessonId === lesson.id);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    this.removeFromCart(lesson);
                }
            }
        },
        removeFromCart(lesson) {
            this.showPopUp({
                message: "Are you sure you want to remove this lesson",
                buttons: [
                    {
                        text: "Remove",
                        class: "btn btn-danger",
                        action: () => {
                            this.cart = this.cart.filter(c => c.lessonId !== lesson.id);
                        }},
                    { text: "Cancel", class: "btn btn-secondary", action: null }
                ]

            });
        },
        getCartItem(lesson) {
            return this.cart.find(c => c.lessonId === lesson.id);
        },
        getAvailabilityText(lesson) {
            const remaining = lesson.availableSpace;

            if (remaining <= 0) {
                return 'Sold Out';
            } else if (remaining <= 5) {
                return `Only ${remaining} spot${remaining > 1 ? 's' : ''} left`;
            } else {
                return 'Buy Now';
            }
        },
        getAvailabilityClass(lesson) {
            const remaining = lesson.availableSpace;

            if (remaining <= 0) return 'bg-danger';
            if (remaining <= 5) return 'bg-warning text-dark';
            return 'bg-success';
        },
        validateForm() {
            this.isNameValid = /^[A-Za-z\s]+$/.test(this.checkoutName);

            this.isPhoneValid = /^[0-9]+$/.test(this.checkoutPhone);

            this.isFormValid = this.isNameValid && this.isPhoneValid;
        },
        submitOrder() {
            console.log(this.cart)
            this.orderSubmitted = true;
            this.showPopUp({
                message: "Sucessfully placed order for lesson",
                autoClose: 1500,
                type: "success"
            });
        },



        // Validators:

        // Validate the auth form fields on input.
        validateAuthField(field) {

            // Clear the previous error for this field.
            this.authErrors[field] = "";

            switch(field) {
                // Validate the email field.
                case 'email':
                    if (!this.email || this.email.trim() === "") {
                        this.authErrors.email = "Email is required.";
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
                        this.authErrors.email = "Invalid email format.";
                    }
                    break;
                // Validate the password.
                case 'password':
                    if (!this.password || this.password.trim() === "") {
                        this.authErrors.password = "Password is required.";
                    } else if (this.password.length < 6) {
                        this.authErrors.password = "Password must be at least 6 characters.";
                    }
                    break;
                // Validate the reset.
                case 'confirmPassword':
                    // Only validate confirmPassword for signup or reset.
                    if (this.currentForm === 'signup' || this.currentForm === 'reset') {
                        if (!this.confirmPassword || this.confirmPassword.trim() === "") {
                            this.authErrors.confirmPassword = "Please confirm password.";
                        } else if (this.password !== this.confirmPassword) {
                            this.authErrors.confirmPassword = "Passwords do not match.";
                        }
                    }
                    break;
            }
        },


        // Validate the lesson form fields on input.
        validateLessonField(field) {
            // Get the value of the field.
            const value = this.lessonForm[field];

            switch (field) {
                // Validate name, description, topic, location.
                case 'name':
                case 'description':
                case 'topic':
                case 'location':
                    if (value === "") {
                        this.errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
                    } else {
                        this.errors[field] = "";
                    }
                    break;

                // Validate space.
                case 'space':
                    if (value === "") {
                        this.errors.space = "Space is required.";
                    } else if (isNaN(value)) {
                        this.errors.space = "Must be a number.";
                    } else if (value < 5) {
                        this.errors.price = "Space cannot be less than 5.";
                    } else {
                        this.errors.space = "";
                    }
                    break;
                
                // Validate price.
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



        // API calls:
        
        // Get all the lessons.
        fetchLessons() {
            fetch(`${this.base_url}/api/lessons/`)
                // Check if the fetch wa successful.
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network was not ok:" + response.statusText);
                    }
                    // Parse the response as JSON.
                    return response.json();
                })
                // Sort the data.
                .then(result => {
                        this.lessons = result.data.map(lesson => ({
                        id: lesson._id,
                        name: lesson.name,
                        description: lesson.description,
                        topic: lesson.topic,
                        location: lesson.location,
                        space: lesson.space,
                        availableSpace: lesson.availableSpace,
                        price: lesson.price,
                        students: lesson.students || [],
                        image: lesson.image
                    }));
                })
                // Catch error errors that might occur.
                .catch(error => {
                    console.error(error);
                });
        },


        // Signup a new user.
        async signup() {
            fetch(`${this.base_url}/api/users/signup`, {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    email : this.email,
                    password : this.password,
                    confirmPassword : this.confirmPassword
                })
            })
            .then(async response => {
                // Get the data from the responce.
                const data = await response.json()

                // if there is an error.
                if (data.status === "error") {
                    // Reset previous errors.
                    this.clearAuthFormSpan();

                    if (data.errors) {
                        // Assign new errors
                        data.errors.forEach(error => {
                            if(error.field && this.authErrors.hasOwnProperty(error.field)) {
                                this.authErrors[error.field] = error.message;
                            }
                        });
                    // If server sent a general error message
                    } else if (data.message) {
                        this.authErrors.confirmPassword = data.message;
                    }
                } else if (data.status === "success") {
                    // Clear form & errors on success.
                    this.clearAuthFormFields()
                    this.clearAuthFormSpan();

                    // Show an alret to the user.
                    await this.showPopUp({
                        message: "Signup Successful.",
                        autoClose: 1000,
                        type: "success"
                    });

                    this.isAuth = true;
                    this.currentUserEmail = data.data;
                    this.currentPage = "home";
                }
            })
            // Catch any that might occur when try to sign up a user.
            .catch(error => {
                console.log("Error while trying to sign up a new user: ", error)
            })
        },


        // Login an existing user.
        async login() {
            fetch(`${this.base_url}/api/users/login`, {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    email : this.email,
                    password : this.password
                })
            })
            .then(async response => {
                // Get the data from the responce.
                const data = await response.json()

                // if there is an error.
                if (data.status === "error") {
                    // Reset previous errors.
                    this.clearAuthFormSpan();

                    if (data.errors) {
                        // Assign new errors
                        data.errors.forEach(error => {
                            if(error.field && this.authErrors.hasOwnProperty(error.field)) {
                                this.authErrors[error.field] = error.message;
                            }
                        });
                    // If server sent a general error message
                    } else if (data.message) {
                        this.authErrors.password = data.message;
                    }
                } else if (data.status === "success") {
                    // Clear form & errors on success.
                    this.clearAuthFormFields()
                    this.clearAuthFormSpan();

                    // Show an alret to the user.
                    await this.showPopUp({
                        message: "Login Successful.",
                        autoClose: 1000,
                        type: "success"
                    });

                    this.isAuth = true;
                    this.currentUserEmail = data.data;
                    this.currentPage = "home";
                }
            })
            // Catch any that might occur when try to sign up a user.
            .catch(error => {
                console.log("Error while trying to login a user: ", error)
            })
        },


        // Reset a user password.
        async reset() {
            fetch(`${this.base_url}/api/users/`, {
                method: "PUT",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    email : this.email,
                    password : this.password,
                    confirmPassword : this.confirmPassword
                })
            })
            .then(async response => {
                // Get the data from the responce.
                const data = await response.json()

                // if there is an error.
                if (data.status === "error") {
                    // Reset previous errors.
                    this.clearAuthFormSpan();

                    if (data.errors) {
                        // Assign new errors
                        data.errors.forEach(error => {
                            if(error.field && this.authErrors.hasOwnProperty(error.field)) {
                                this.authErrors[error.field] = error.message;
                            }
                        });
                    // If server sent a general error message
                    } else if (data.message) {
                        this.authErrors.confirmPassword = data.message;
                    }
                } else if (data.status === "success") {
                    // Clear form & errors on success.
                    this.clearAuthFormFields()
                    this.clearAuthFormSpan();

                    // Show an alret to the user.
                    await this.showPopUp({
                        message: "Password reset Successful.",
                        autoClose: 1000,
                        type: "success"
                    });

                    this.isAuth = true;
                    this.currentUserEmail = data.data;
                    this.currentPage = "home";
                }
            })
            // Catch any that might occur when try to sign up a user.
            .catch(error => {
                console.log("Error while trying to reset a user's password: ", error)
            })
        },



        // Helper methods:

        // Helper function to toggle between pages.
        setPage(page) {
            // Check if the user is trying to access "My Lesson" page without sign up.
            if ((page === 'lesson' ) && !this.isAuth) {
                // Show a pop-up warning.
                this.showPopUp({
                    message: "You need to login first to access this page.",
                    autoClose: 1000,
                    type: "warning"
                }).then(() => {
                    // Redirect to login page
                    this.currentForm = 'login';
                    this.currentPage = 'login';
                });
                return;
            }

            // Normal page switching.
            this.currentPage = page;
        },


        // Helper function to clear all the field in the auth form.
        clearAuthFormFields() {
            this.email = "";
            this.password = "";
            this.confirmPassword = "";
        },


        // Helper function to clear all the error span in the auth form.
        clearAuthFormSpan() {
            this.authErrors = {
                email: "",
                password: "",
                confirmPassword: ""
            };
        },


        // Helper function to display a pop to info user of something or pop to be use as a comfirmation message.
        showPopUp({ message = "Do you want to continue?", buttons = null, autoClose = 0, type = null } = {}) {
            // Returns a promise so that the caller can await the user's responce.
            return new Promise((resolve) => {
                // Create an overlay div for the confirmation form.
                const comfirmationForm = document.createElement('div');
                comfirmationForm.className = 'comfirmation-form-overlay';

                // Create content contain for the message and button.
                const content = document.createElement('div');

                // Create a paragraph element for the message text.
                const msg = document.createElement('p');
                msg.textContent = message;
                content.appendChild(msg);

                // If autoClose is greater than 0, display a temporary alert.
                if (autoClose > 0) {
                    let iconHTML = '';
                    // Choose icon based on type.
                    switch(type) {
                        case "success":
                            iconHTML = '<i class="fa fa-check-circle" style="margin-right:0.5rem"></i>';
                            break;
                        case "danger":
                            iconHTML = '<i class="fa fa-times-circle" style="margin-right:0.5rem"></i>';
                            break;
                        case "warning":
                            iconHTML = '<i class="fa fa-exclamation-triangle" style="margin-right:0.5rem"></i>';
                            break;
                        default:
                            iconHTML = '<i class="fa fa-info-circle" style="margin-right:0.5rem"></i>';
                    }
                    // Add alert styling classes.
                    content.classList.add("alert", "alert-" + type, "d-flex", "align-items-center", "justify-content-center");
                    
                    // Set the inner HTML with the icon and message.
                    content.innerHTML = iconHTML + message;
                    comfirmationForm.appendChild(content);
                    document.body.appendChild(comfirmationForm);

                    // Automatically remove the pop-up after autoClose milliseconds.
                    setTimeout(() => {
                        if (document.body.contains(comfirmationForm)) {
                            document.body.removeChild(comfirmationForm);
                        }
                        resolve();
                    }, autoClose);

                    return;
                };

                // If autoClose is not set, create a normal confirmation box.
                content.className = 'comfirmation-form-box';

                // Set default buttons if none are provided.
                if (!buttons || buttons.length === 0) {
                    buttons = [
                        { text: "Yes", class: "btn btn-danger", action: null },
                        { text: "No", class: "btn btn-secondary", action: null }
                    ];
                };

                // Create buttons dynamically and attach click handlers.
                buttons.forEach(button => {
                    const buttonElement = document.createElement("button");
                    buttonElement.textContent = button.text || "Button";
                    buttonElement.className = button.class || "btn btn-secondary";
                    buttonElement.onclick = () => {
                        document.body.removeChild(comfirmationForm);
                        if (button.action || typeof button.action === "function") {
                            button.action();
                        };
                        resolve();
                    };
                    content.appendChild(buttonElement);
                });

                comfirmationForm.appendChild(content);
                document.body.appendChild(comfirmationForm);
            });
        }
    },
    computed: {

        // Auth Form:

        // Return the main header title for the auth form based on the current form.
        headerTitle() {
            if (this.currentForm === 'login') {
                return 'Hello, again';
            }
            if (this.currentForm === 'signup') {
                return 'Create Account';
            }
            if (this.currentForm === 'reset') {
                return 'Reset Password';
            }
        },


        // Return the subtitle under the main header for the auth form based on the current form.
        headerSubtitle() {
            if (this.currentForm === 'login') {
                return 'We are happy to have you back.'
            }
            if (this.currentForm === 'signup') {
                return 'Join us and start learning.'
            }
            if (this.currentForm === 'reset') {
                return 'Enter your email to reset your password.'
            }
        },


        // Return the title shown on the left side of the form.
        leftTitle() {
            if (this.currentForm === 'login') {
                return 'Be Ready to Learn.'
            }
            if (this.currentForm === 'signup') {
                return 'Start Your Journey.'
            }
            if (this.currentForm === 'reset') {
                return 'Forgot Password?'
            }
        },


        // Return a slogan or motivational text for the left section of the form.
        leftSlogan() {
            if (this.currentForm === 'login') {
                return 'Learn Anything, Anytime.';
            }
            if (this.currentForm === 'signup') {
                return 'Sign up and unlock knowledge.';
            }
            if (this.currentForm === 'reset') {
                return 'We will help you recover your account.';
            }
        },


        // Returns the text to display on the main action button.
        actionText() {
            if (this.currentForm === 'login') {
                return 'Login';
            }
            if (this.currentForm === 'signup') {
                return 'Sign Up';
            }
            if (this.currentForm === 'reset') {
                return 'Reset';
            }
        },



        //
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
        },
        cartWithLessonDetails() {
            return this.cart.map(item => {
                const lesson = this.lessons.find(l => l.id === item.lessonId);
                return { ...item, ...lesson };
            });
        }
    },
    mounted() {
        this.adjustMainLayout();
        window.addEventListener('resize', this.handleResize);
        this.loadSortOptions();

        // Fetch lessons from backend when app loads
        if (this.currentPage === 'home') {
            this.fetchLessons();
        }
    },
    created() {
        this.isSmallScreen = window.innerWidth < 768

        if (!this.isSmallScreen) {
            this.showFilters = true;
        }
    }
})