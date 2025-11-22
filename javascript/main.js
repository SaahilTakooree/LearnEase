new Vue({
    el: '#app',
    data: {        
        // API base URL.
        base_url: "https://learnease-backend-rjr2.onrender.com",
        
        currentUserEmail: "teacher@example.com",
        currentPage: "home",

        // Header data.
        searchQuery: "",
        searchTimeout: null,

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
        allLessons: [],

        // My lesson page.
        taughtLessons: [],
        enrolledLessons: [],
        lessonForm: {
            name: "",
            description: "",
            topic: "",
            location: "",
            space: "",
            price: "",
            image: 'Other',
            student: [],
        },
        lessonErrors: {
            name: "",
            description: "",
            topic: "",
            location: "",
            space: "",
            price: "",
            image: ""
        },
        imageOptions: [
            { name: 'Art', file: 'art.jpeg' },
            { name: 'Biology', file: 'biology.jpeg' },
            { name: 'Chemistry', file: 'chemistry.jpeg' },
            { name: 'Computer', file: 'computer.jpeg' },
            { name: 'History', file: 'history.jpeg' },
            { name: 'Math', file: 'math.jpeg' },
            { name: 'Music', file: 'music.jpeg' },
            { name: 'PE', file: 'pe.jpeg' },
            { name: 'Other', file: 'other.jpeg' },
            { name: 'Physics', file: 'physics.jpeg' }
        ],
        isEditing: false,
        showLessonForm: false,
        studentPage: 1,

        // Shopping cart.
        cart: [],
        checkoutForm : {
            name : "",
            phone : ""
        },
        checkoutErrors: {
            name : "",
            phone : ""
        },
        isCheckoutFormValid : false,
    },
    methods: {
        // Change from cart page to home page when in the checkout page.
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


        // Function to resize the element dynamically
        adjustMainLayout() {
            const header = document.getElementById('header');
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');

            if (!header || !mainContent) {
                return;
            }

            const headerHeight = header.offsetHeight;
            mainContent.style.marginTop = headerHeight + 'px';

            if (sidebar) {
                // Only do sidebar adjustments if it exists (home page).
                const sidebarLeft = sidebar.offsetLeft;
                const sidebarHeight = sidebar.offsetHeight;

                sidebar.style.top = headerHeight + 'px';

                if (window.innerWidth > 767) {
                    sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
                    mainContent.style.marginLeft = sidebarLeft + 'px';
                } else {
                    sidebar.style.height = 'auto';
                    mainContent.style.marginLeft = '0';
                    mainContent.style.marginTop = headerHeight + sidebarHeight + 'px';
                }
            } else {
                // If there is not sidebar, reset margin-left.
                mainContent.style.marginLeft = '0';
            }
            // Force reflow.
            mainContent.getBoundingClientRect();
        },
        handleResize() {
            this.isSmallScreen = window.innerWidth <= 768
            this.adjustMainLayout();

            if (!this.isSmallScreen) {
                this.showFilters = true;
            } else {
                this.showFilters = false;
            }
        },



        // Header method.

        // Debounced input handler
        onSearchInput() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchLessons();
            }, 100);
        },


        // Function to log a user out.
        logOut() {
            this.currentUserEmail = "";
            this.isAuth = false;
            this.setPage("home");

            // Adject the layout
            this.$nextTick(() => {
                // Slight delay to ensure DOM is rendered.
                setTimeout(() => {
                    this.adjustMainLayout();
                }, 50); 
            });
        },



        // Sidebar method.

        // Function to hide or unhide the filters
        toggleFilters() {
            this.showFilters = !this.showFilters;
        },

        // Function to get the sorted options.
        loadSortOptions() {
            const textOptions = [
                { value: 'topic', text: 'Subject' },
                { value: 'location', text: 'Location' },
                { value: 'price', text: 'Price' },
                { value: 'spaces', text: 'Spaces' },
                { value: 'availableSpace', text: 'Available Spaces' }
            ]

            this.sortOptions = textOptions;
            if (textOptions.length > 0) {
                this.sortAttribute = textOptions[0].value;
            }
        },


        // Function to sort the lessons.
        sortLessons() {
            let sorted = [...this.lessons];

            // Determine the attribute to sort by.
            const attr = this.sortAttribute;
            const order = this.sortOrder === 'asc' ? 1 : -1;

            sorted.sort((a, b) => {
                let valA, valB;

                if (attr === 'topic') {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                } else if (attr === 'location') {
                    valA = a.location.toLowerCase();
                    valB = b.location.toLowerCase();
                } else if (attr === 'price') {
                    valA = Number(a.price);
                    valB = Number(b.price);
                } else if (attr === 'spaces') {
                    valA = Number(a.space);;
                    valB = Number(b.space);;
                } else if (attr === 'availableSpace') {
                    valA = this.getRemainingSpace(a);
                    valB = this.getRemainingSpace(b);
                }

                if (valA < valB) {
                    return -1 * order;
                }
                if (valA > valB) {
                    return 1 * order;
                }
                return 0;
            });

            this.lessons = sorted;
        },



        // Home page method:

        // Function to add product to cart.
        addToCart(lesson) {
            const remaining = this.getRemainingSpace(lesson);

            if (remaining <= 0) {
                return;
            };

            const item = this.cart.find(c => c.lessonId === lesson._id);

            if (!item) {
                this.cart.push({ lessonId: lesson._id, quantity: 1 });
            }
        },


        // Function to increase the quanity of an item to cart.
        increaseQuantity(lesson) {
            const remaining = this.getRemainingSpace(lesson); 
            if (remaining > 0) {
                const item = this.cart.find(c => c.lessonId === lesson._id);
                if (item) {
                    item.quantity++;
                }
            }
        },


        // Function to decrease the quanity of item to cart.
        decreaseQuantity(lesson) {

            const item = this.cart.find(c => c.lessonId === lesson._id);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    this.removeFromCart(lesson);
                }
            }
        },


        // Function to remove the lesson from the cart.
        removeFromCart(lesson) {
            this.showPopUp({
                message: "Are you sure you want to remove this lesson from cart.",
                buttons: [
                    {
                        text: "Remove",
                        class: "btn btn-danger",
                        action: () => {
                            this.cart = this.cart.filter(c => c.lessonId !== lesson._id);

                            if (this.cart.length === 0 && this.currentPage === "shoppingCart") {
                            this.showPopUp({
                                message: "Your cart is now empty. Returning to homepage.",
                                type: "warning",
                                autoClose: 1000
                            }).then(() => {
                                this.setPage("home");
                            });
            };
                        }},
                    { text: "Cancel", class: "btn btn-secondary", action: null }
                ]
            });
        },


        // Function to handle the function of the add to cart button.
        handleAddToCart(lesson) {
            // If lesson is not yet in cart, add it.
            if (!this.getCartItem(lesson)) {
                this.addToCart(lesson);
            } 
            // If lesson is already in cart, increase quantity.
            else {
                this.increaseQuantity(lesson);
            }
        },


        // Function to know what text that the availability text should be.
        getAvailabilityText(lesson) {
            const remaining = this.getRemainingSpace(lesson);

            if (remaining <= 0) {
                return 'Sold Out';
            } else if (remaining <= 5) {
                return `Only ${remaining} spot${remaining > 1 ? 's' : ''} left`;
            } else {
                return 'Buy Now';
            }
        },


        // Function to know what colour that the availability badge should be.
        getAvailabilityClass(lesson) {
            const remaining = this.getRemainingSpace(lesson);

            if (remaining <= 0) {
                return 'bg-danger';
            }
            if (remaining <= 5) {
                return 'bg-warning text-dark';
            }
            return 'bg-success';
        },


        // Function get the number of item in a cart.
        getCartItem(lesson) {
            return this.cart.find(c => c.lessonId === lesson._id);
        },



        // Auth method:

        // Function to handle opening of the auth form
        openAuthForm() {
            this.currentForm = 'login';
            this.currentPage = 'login';
        },
        

        // Function to handle what the back button does in the auth form.
        handleAuthBack() {
            // Clear form & errors on success.
            this.clearAuthFormFields()
            this.clearAuthFormSpan();

            if (this.currentForm === 'login') {
                this.currentPage = 'home';
                this.$nextTick(() => {
                    // Slight delay to ensure DOM is rendered.
                    setTimeout(() => {
                        this.adjustMainLayout();
                    }, 50); 
                });
            } else if (this.currentForm === 'signup') {
                this.currentForm = 'login';
            } else if (this.currentForm === 'reset') {
                this.currentForm = 'login';
            }
        },


        // Function to switch between different auth form.
        switchForm(formName) {
            // Clear form & errors on success.
            this.clearAuthFormFields();
            this.clearAuthFormSpan();

            this.currentForm = formName;
        },


        // Function to handle what does the submit button does.
        async submitAction() {
            if (this.currentForm === "signup") {
                await this.signup()
            } else if (this.currentForm === "login") {
                await this.login()
            } else if (this.currentForm === "reset") {
                await this.reset()
            }
        },


        // My Lesson page method.

        // Function to open the lesson form.
        openLessonForm() {
            this.resetLessonForm();
            this.isEditing = false;
            this.showLessonForm = true
        },


        // Function to submit or update the 
        async submitLesson() {
            // Check if the there are any invalid field.
            Object.keys(this.lessonForm).forEach(
                field => this.validateLessonField(field)
            );
            const hasError = Object.values(this.lessonErrors).some(error => error !== '');
            if (hasError) {
                return;
            };

            // Show confirmation popup before submitting.
            const confirm = await this.showPopUp({
                message: this.isEditing
                    ? "Are you sure you want to update this lesson?"
                    : "Are you sure you want to add this lesson?",
                buttons: [
                    {
                        text: "Yes",
                        class: "btn btn-danger",
                        action: () => true
                    },
                    {
                        text: "Cancel",
                        class: "btn btn-secondary",
                        action: () => false
                    }
                ]
            });

            // If user clicked "Cancel", do nothing
            if (!confirm) {
                return;
            }

            // Prepare JSON data
            const lessonData = {
                name: this.lessonForm.name,
                description: this.lessonForm.description,
                topic: this.lessonForm.topic,
                location: this.lessonForm.location,
                space: Number(this.lessonForm.space),
                price: Number(this.lessonForm.price),
                image: this.lessonForm.image
            };

            if (this.isEditing) {
                await this.updateLesson(lessonData, null)
                // Show an alret to the user.
                await this.showPopUp({
                    message: "Lesson Updated Successful.",
                    autoClose: 1000,
                    type: "success"
                });
            } else {
                lessonData.createdBy = this.currentUserEmail; 
                await this.addLesson(lessonData)
            }
        },


        // Function to start the editing process by populating the lesson form.
        editLesson(lesson) {
            this.resetLessonForm();
            this.lessonForm = { ...lesson };
            if (lesson.image) {
                this.lessonForm.image = lesson.image.split('/').pop();
            }
            this.isEditing = true;
            this.showLessonForm = true
        },


        // Function to remove a student from a lesson.
        async removeStudentFromStudent(student = {}, lesson = {}) {

            const confirmDelete = await this.showPopUp({
                message: "Are you sure you want remove this student from this lesson?",
                buttons: [
                    {
                        text: "Delete",
                        class: "btn btn-danger",
                        action: () => true
                    },
                    {
                        text: "Cancel",
                        class: "btn btn-secondary",
                        action: () => false
                    }
                ]
            });

            // User cancelled.
            if (!confirmDelete) {
                return;
            }

            // Define variable with exact value.
            let _id = "";
            let email = "";

            if (Object.keys(student).length !== 0) {
                _id = this.lessonForm._id
                email = student.email
            } else {
                _id = lesson._id;
                email = this.currentUserEmail;
            }

            const payload = {
                students: {
                    action: "remove",
                    student: {
                        email: email,
                        space: 1
                    }
                }
            };

            // Update the lesson.
            await this.updateLesson(payload, _id);

            // Show an alert to the user.
            await this.showPopUp({
                message: "Successfully Remove Student From Lesson.",
                autoClose: 1000,
                type: "success"
            });
            
        },


        // Function to get the next page of the enrolled section in the lesson form.
        nextPage() {
            const total = this.lessonForm.students.length;
            const maxPage = Math.ceil(total / 5);
            if (this.studentPage < maxPage) {
                this.studentPage++;
            }
        },


        // Function to get the previous page of the enrolled section in the lesson form.
        prevPage() {
            if (this.studentPage > 1) {
                this.studentPage--;
            }
        },


        // Function to delete a lesson
        async deleteLesson(lesson) {
            // Show confirmation popup before deleting.
            const confirmDelete = await this.showPopUp({
                message: "Are you sure you want to delete this lesson?",
                buttons: [
                    {
                        text: "Delete",
                        class: "btn btn-danger",
                        action: () => true
                    },
                    {
                        text: "Cancel",
                        class: "btn btn-secondary",
                        action: () => false
                    }
                ]
            });

            if (!confirmDelete) {
                return; // User cancelled
            }

            this.closeLessonForm();
            
            await this.deleteALesson(lesson._id)
        },


        // Function to populate taught lesson table.
        async populateTaughtLessons() {
            await this.getTaughtLesson();
        },


        // Function to populate the enrolled lesson table. 
        async populateEnrolledLessons() {
            await this.getEnrolledLesson();
        },


        // Checkout page.

        // Function to add an order.
        async submitOrder() {
            // Check if the there are any invalid field.
            Object.keys(this.checkoutForm).forEach(
                field => this.validateCheckoutField(field)
            );
            const hasError = Object.values(this.checkoutErrors).some(error => error !== '');
            if (hasError) {
                return;
            };

            // Show confirmation popup before submitting.
            const confirm = await this.showPopUp({
                message: "Do you want to place order",
                buttons: [
                    {
                        text: "Yes",
                        class: "btn btn-danger",
                        action: () => true
                    },
                    {
                        text: "Cancel",
                        class: "btn btn-secondary",
                        action: () => false
                    }
                ]
            });

            // If user clicked "Cancel", do nothing
            if (!confirm) {
                return;
            }

            const lessonsData = this.cart.map(item => ({
                id: item.lessonId,
                spaces: item.quantity
            }));

            // Prepare JSON data
            const orderData = {
                name : this.checkoutForm.name,
                phone : this.checkoutForm.phone,
                lessonsData : lessonsData,
                email : this.currentUserEmail
            };

            const result = await this.addOrder(orderData);
            let successes = [];

            if (result === "success") {
                for (const lesson of lessonsData) {
                    const payload = {
                        students: {
                            action: "add",
                            student: {
                                email: this.currentUserEmail,
                                space: lesson.spaces
                            }
                        }
                    };

                    try {
                        const status = await this.updateLesson(payload, lesson.id);
                        successes.push(status === "success");
                    } catch (err) {
                        console.error(`Failed to update lesson ${lesson.id}:`, err);
                        successes.push(false);
                    }
                }
            }

            const allSuccessful = successes.every(s => s === true);

            if (allSuccessful && result === "success") {
                this.cart = [];

                await this.showPopUp({
                    message: "Successfully ordered lesson(s).",
                    autoClose: 1500,
                    type: "success"
                });

                this.checkoutForm.name = "";
                this.checkoutForm.phone = "";

                this.setPage("lesson");
            } else {
                await this.showPopUp({
                    message: "Fail to add orders.",
                    autoClose: 2500,
                    type: "warning"
                });
            }
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
                    if (!value || value.trim() === "") {
                        this.lessonErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
                    } else {
                        this.lessonErrors[field] = "";
                    }
                    break;

                // Validate space.
                case 'space':
                    if (value === "" || value === null || value === undefined) {
                        this.lessonErrors.space = "Space is required.";
                    } else if (isNaN(value)) {
                        this.lessonErrors.space = "Must be a number.";
                    } else if (value < 5) {
                        this.lessonErrors.space = "Space cannot be less than 5.";
                    } else {
                        this.lessonErrors.space = "";
                    }
                    break;
                
                // Validate price.
                case 'price':
                    if (value === "" || value === null || value === undefined) {
                        this.lessonErrors.price = "Price is required.";
                    } else if (isNaN(value)) {
                        this.lessonErrors.price = "Must be a number.";
                    } else if (value < 0) {
                        this.lessonErrors.price = "Price cannot be less than zero.";
                    } else {
                        this.lessonErrors.price = "";
                    }
                    break;
                
                // Validate the image.
                case 'image':
                    const filename = value.split('/').pop();
                if (!this.imageOptions.some(img => img.file === filename)) {
                    this.lessonErrors.image = "Invalid image selected.";
                } else {
                    this.lessonErrors.image = "";
                }
                break;
                }
        },


        // Validate checkout form;
        validateCheckoutField(field) {
            // Get the value of the field.
            const value = this.checkoutForm[field];

            switch(field) {
                // Validate name field.
                case 'name':
                    if (value.trim() === "") {
                        this.checkoutErrors.name = "Name is required."
                    } else if (!/^[A-Za-z]+$/.test(value)) {
                        this.checkoutErrors.name = "Name must contain letters only.";
                    } else {
                        this.checkoutErrors.name = "";
                    }
                    break;
                
                // Validate phone field.
                case 'phone':
                    if (!value || value.trim() === "") {
                        this.checkoutErrors.phone = "Phone number is required.";
                    } else if (!/^\d{7,15}$/.test(value.trim())) {
                        this.checkoutErrors.phone = "Invalid phone number format. Only digits allowed, 7-15 digits.";
                    } else {
                        this.checkoutErrors.phone = "";
                    }
                    break;
            }

            // Form is valid if no errors.
            this.isCheckoutFormValid =  this.checkoutErrors.name === "" && this.checkoutErrors.phone === "";
        },



        // API calls:
        
        // Get all the lessons.
        async fetchLessons() {
            fetch(`${this.base_url}/api/lessons/`)
            // Check if the fetch wa successful.
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network was not ok:" + response.statusText);
                }
                // Parse the response as JSON.
                return response.json();
            })
            // Map the data.
            .then(result => {
                    this.allLessons = result.data.map(lesson => ({
                    _id: lesson._id,
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

                this.lessons = [...this.allLessons];

                this.sortLessons(); 
            })
            // Catch error errors that might occur.
            .catch(error => {
                this.lessons = [];
                console.error("Error while getting the lessons", error);
            });
        },


        // Function to search for specific lesson.
        async searchLessons() {
            const query = this.searchQuery.trim();

            if (query === "") {
                await this.fetchLessons();
                return;
            }

            fetch(`${this.base_url}/api/search?q=${encodeURIComponent(query)}`)
            // Check if the fetch wa successful.
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network was not ok:" + response.statusText);
                }
                // Parse the response as JSON.
                return response.json();
            })
            // Map the data.
            .then(result => {
                    this.lessons = result.data.map(lesson => ({
                    _id: lesson._id,
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

                this.sortLessons(); 
            })
            // Catch error errors that might occur.
            .catch(error => {
                this.fetchLessons();
                this.showPopUp({
                    message: "Unable to search for specific lesson.",
                    autoClose: 1000,
                    type: "error"
                });
                console.error("Error while trying to search for specific lessons", error);
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

                    // Adjust layout after login
                    this.$nextTick(() => {
                        // Slight delay to ensure DOM is rendered.
                        setTimeout(() => {
                            this.adjustMainLayout();
                        }, 50); 
                    });
                }
            })
            // Catch any that might occur when trying to sign up a user.
            .catch(error => {
                console.error("Error while trying to sign up a new user: ", error)
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

                    // Adjust layout after login
                    this.$nextTick(() => {
                        // Slight delay to ensure DOM is rendered.
                        setTimeout(() => {
                            this.adjustMainLayout();
                        }, 50); 
                    });
                }
            })
            // Catch any that might occur when trying to sign up a user.
            .catch(error => {
                console.error("Error while trying to login a user: ", error)
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
                        message: "Password Reset Successful.",
                        autoClose: 1000,
                        type: "success"
                    });

                    this.isAuth = true;
                    this.currentUserEmail = data.data;
                    this.currentPage = "home";

                    // Adjust layout after login
                    this.$nextTick(() => {
                        // Slight delay to ensure DOM is rendered.
                        setTimeout(() => {
                            this.adjustMainLayout();
                        }, 50); 
                    });
                }
            })
            // Catch any that might occur when trying to sign up a user.
            .catch(error => {
                console.error("Error while trying to reset a user's password: ", error)
            })
        },


        // Add a new lesson.
        async addLesson(lessonData) {
            fetch(`${this.base_url}/api/lessons/`, {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(lessonData)
            })
            .then(async response => {
                // Get the data from the responce.
                const data = await response.json()

                // if there is an error.
                if (data.status === "error") {
                    if (data.errors) {
                        // Assign new errors
                        data.errors.forEach(error => {
                            if(error.field && this.lessonErrors.hasOwnProperty(error.field)) {
                                this.lessonErrors[error.field] = error.message;
                            } else {
                                this.lessonErrors["price"] = error.message;
                            }
                        });
                    // If server sent a general error message
                    } else if (data.message) {
                        this.lessonErrors.image = data.message;
                    }
                } else if (data.status === "success") {
                    this.closeLessonForm();
                    await this.populateTaughtLessons();

                    // Show an alret to the user.
                    await this.showPopUp({
                        message: "Lesson Added Successful.",
                        autoClose: 1000,
                        type: "success"
                    });
                }
            })
            // Catch any that might occur when trying to update an existing lesson.
            .catch(error => {
                console.error("Error while trying to add a lesson: ", error)
            })
        },


        // Add update an existing lesson.
        async updateLesson(lessonData, _id = null) {

            // Check if id is passed in.
            const isFormLesson = _id === null;
            if (isFormLesson) {
                _id = this.lessonForm._id;
            }

            return fetch(`${this.base_url}/api/lessons/${_id}`, {
                method: "PUT",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(lessonData)
            })
            .then(async response => {
                // Get the data from the responce.
                const data = await response.json()

                // if there is an error.
                if (data.status === "error") {
                    if (data.errors) {
                        // Assign new errors
                        data.errors.forEach(error => {
                            if(error.field && this.lessonErrors.hasOwnProperty(error.field)) {
                                this.lessonErrors[error.field] = error.message;
                            } else {
                                this.lessonErrors["image"] = error.message;
                            }
                        });
                    // If server sent a general error message
                    } else if (data.message) {
                        this.lessonErrors.image = data.message;
                    }
                } else if (data.status === "success") {
                    // Refresh the appropriate list based on whether _id was passed
                    if (isFormLesson) {
                        await this.populateEnrolledLessons();
                        await this.populateTaughtLessons();
                        this.closeLessonForm();
                    } else {
                        await this.populateEnrolledLessons();
                        await this.populateTaughtLessons();
                        this.closeLessonForm();
                    }
                }
                return data.status
            })
            // Catch any that might occur when trying to update an existing lesson.
            .catch(error => {
                console.error("Error while trying to update an existing lesson: ", error)
            })
        },


        // Delete a lesson
        async deleteALesson(id) {
            fetch(`${this.base_url}/api/lessons/${id}`, {
                method: "DELETE",
                headers : {
                    "Content-Type" : "application/json"
                }
            })
            .then(async response => {
                const data = await response.json();

                if (data.status === "success") {
                    await this.populateTaughtLessons();
                    // Show success popup
                    await this.showPopUp({
                        message: "Lesson Deleted Successfully.",
                        autoClose: 1000,
                        type: "success"
                    });
                    return data;
                } else if (data.status === "error") {
                    await this.showPopUp({
                        message: data.message || "Failed to delete lesson.",
                        autoClose: 2000,
                        type: "danger"
                    });
                }
            })
            // Catch any that might occur when trying to delete a lesson.
            .catch(error => {
                console.error("Error while trying to delete a lesson: ", error)
            })
        },


        // Function to get lesson that someone is teaching.
        async getTaughtLesson() {
            fetch(`${this.base_url}/api/lessons/taught`, {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    email : this.currentUserEmail
                })
            })
            // Check if the fetch wa successful.
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network was not ok:" + response.statusText);
                }
                // Parse the response as JSON.
                return response.json();
            })
            // Map the data.
            .then(result => {
                    this.taughtLessons = result.data.map(lesson => ({
                    _id: lesson._id,
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
            // Catch error errors that might occur when trying to get the taught the lesson.
            .catch(error => {
                this.taughtLessons = []
                console.error(error);
            });
        },


        // Function to get lesson that someone is enrolled in.
        async getEnrolledLesson() {
            fetch(`${this.base_url}/api/lessons/enrolled`, {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    email : this.currentUserEmail
                })
            })
            // Check if the fetch wa successful.
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network was not ok:" + response.statusText);
                }
                // Parse the response as JSON.
                return response.json();
            })
            // Map the data.
            .then(result => {
                    this.enrolledLessons = result.data.map(lesson => ({
                    _id: lesson._id,
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
            // Catch error errors that might occur when trying to the lesson that someone is enrolled in.
            .catch(error => {
                this.enrolledLessons = []
                console.error(error);
            });
        },


        // Add an order.
        async addOrder(orderData) {
            return fetch(`${this.base_url}/api/orders/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(data => {

                if (data.status === "error") {

                    if (data.errors) {
                        data.errors.forEach(error => {
                            if (error.field && this.checkoutErrors.hasOwnProperty(error.field)) {
                                this.checkoutErrors[error.field] = error.message;
                            } else {
                                this.checkoutErrors.phone = error.message;
                            }
                        });
                    } else if (data.message) {
                        this.checkoutErrors.phone = data.message;
                    }
                    return "error"
                }

                if (data.status === "success") {
                    return data.status;
                }
            })
            .catch(error => {
                console.error("Add order error:", error);
                return { status: "error", message: error };
            });
        },




        // Helper methods:

        // Helper function to toggle between pages.
        async setPage(page) {
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

            // Adjust the layout.
            this.$nextTick(() => {
                // Slight delay to ensure DOM is rendered.
                setTimeout(() => {
                    this.adjustMainLayout();
                }, 50); 
            });
            this.searchQuery = "";

            if (page === "home") {
                await this.fetchLessons();
            };

            if (page === "lesson") {
                await this.populateTaughtLessons();
                await this.populateEnrolledLessons();
            }
        },


        // Helper function to know the available space left in each lessons. 
        getRemainingSpace(lesson) {
            const cartItem = this.cart.find(c => c.lessonId === lesson._id);
            const quantityInCart = cartItem ? cartItem.quantity : 0;

            const remaining = lesson.availableSpace - quantityInCart;

            return remaining > 0 ? remaining : 0;
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


        // Helper function to clear all the field and errors from the lesson form.
        resetLessonForm() {
            this.lessonForm = {
                _id: '',
                name: '',
                description: '',
                topic: '',
                location: '',
                space: '',
                price: '',
                image: 'Other',
                students: []
            };
            this.lessonErrors = {
                name: '',
                description: '',
                topic: '',
                location: '',
                space: '',
                price: '',
                image: ''
            }
            this.isEditing = false;
        },


        // Function to close the lesson form.
        closeLessonForm() {
            this.resetLessonForm();
            this.isEditing = false;
            this.showLessonForm = false;
        },



        // Helper function to display a pop to info user of something or pop to be use as a confirmation message.
        showPopUp({ message = "Do you want to continue?", buttons = null, autoClose = 0, type = null } = {}) {
            // Returns a promise so that the caller can await the user's responce.
            return new Promise((resolve) => {
                // Create an overlay div for the confirmation form.
                const confirmationForm = document.createElement('div');
                confirmationForm.className = 'confirmation-form-overlay';

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
                    confirmationForm.appendChild(content);
                    document.body.appendChild(confirmationForm);

                    // Automatically remove the pop-up after autoClose milliseconds.
                    setTimeout(() => {
                        if (document.body.contains(confirmationForm)) {
                            document.body.removeChild(confirmationForm);
                        }
                        resolve();
                    }, autoClose);

                    return;
                };

                // If autoClose is not set, create a normal confirmation box.
                content.className = 'confirmation-form-box';

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
                        document.body.removeChild(confirmationForm);
                        let result = null;
                        if (button.action || typeof button.action === "function") {
                            result = button.action();
                        };
                        resolve(result);
                    };
                    content.appendChild(buttonElement);
                });

                confirmationForm.appendChild(content);
                document.body.appendChild(confirmationForm);
            });
        }
    },
    computed: {

        // Auth form computed:

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



        // Lesson form computed:

        // Function to divide the student in one lesson into groups of 5.
        paginatedStudents() {
            const start = (this.studentPage - 1) * 5;
            return this.lessonForm.students.slice(start, start + 5);
        },



        // Shopping cart computed.

        // Function to get the item in the cart.
        cartWithLessonDetails() {
            return this.cart.map(item => {
                const lesson = this.allLessons.find(l => l._id.toString() === item.lessonId.toString()) || {};
                return { ...item, ...lesson };
            });
        }
    },
    mounted() {
        // Resize the element when the app loads.
        this.adjustMainLayout();
        window.addEventListener('resize', this.handleResize);
        this.loadSortOptions();

        // Fetch lessons from backend when app loads.
        if (this.currentPage === 'home') {
            this.fetchLessons();
        }
    },
    created() {
        // Detect initial screen size before rendering.
        this.isSmallScreen = window.innerWidth <= 768

        // On large screen always show the filter.
        if (!this.isSmallScreen) {
            this.showFilters = true;
        }
    }
});