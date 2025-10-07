new Vue({
    el: '#sidebar',
    data: {
        showFilters: false,
        sortAttribute: '',
        sortOrder: 'asc',
        isSmallScreen: window.innerWidth < 768,
        sortOptions: []
    },
    mounted() {
        this.adjustSidebar();
        window.addEventListener('resize', this.handleResize);
        this.loadSortOptions();
    },
    methods: {
        toggleFilters() {
            this.showFilters = !this.showFilters;
        },
        adjustSidebar() {
            const header = document.getElementById('header');
            const sidebar = document.getElementById('sidebar');
            if (!header || !sidebar) {
                return;
            }
            const headerHeight = header.offsetHeight;
            sidebar.style.top = headerHeight + 'px';
            if (window.innerWidth > 767) {
                sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
            } else {
                sidebar.style.height = 'auto';
            }
        },
        handleResize() {
            this.isSmallScreen = window.innerWidth < 768
            this.adjustSidebar();

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
        },
    },
    created() {
        this.isSmallScreen = window.innerWidth < 768

        if (!this.isSmallScreen) {
            this.showFilters = true;
        }
    }
});