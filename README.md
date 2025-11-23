# LearnEase

## Project Structure
```text
LearnEase/
|-index.html
|
|-assets/
│   |-LearnEaseLogo.png
│
|-javascript/
│   |-main.js
│
|-style/
|   |-auth.css
|   |-card.css
|   |-confirmationForm.css
|   |-header.css
|   |-main.css
|   |-myLesson.css
|   |-sidebar.css
|
|-README.md
```

## Warning About Render Free Tier

This project uses Render.com (Free Tier) to host the backend API. 

Render free plans "go inactive" your backend after some inactivity. When the backend wakes up again, loading may take up to 2 minutes.

If the app takes too long to load lessons or fails to fetch data:
- Wait up to 2 minutes
- If still not loading: refresh the page

This is normal behavior when using Render’s free tier.

## Configuration (If running locally) 
**Important: The backend has CORS restrictions.**
```javascript
app.use(cors({
    origin: "https://saahiltakooree.github.io",
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
```
This means if you run the front-end locally (by opening index.html in your browser), you cannot use the deployed Render backend, because the backend only accepts requests from https://saahiltakooree.github.io. You must run a local backend to use the front-end locally.

If you want to see how to get the code and run the backend locally, clone the backend repository and follow its README:
https://github.com/SaahilTakooree/LearnEase-Backend

### Frontend Configuration.
The API base URL is defined inside javascript/main.js:

API base URL
```vue.js
base_url: "https://learnease-backend-rjr2.onrender.com",
```
### Using Local Backend

If you want to run your backend locally instead of using Render:

- By default, the backend runs on port 6969.

- Update the base URL in main.js if you use a different port:

``` vue.js
base_url: "http://localhost:{your-port}",
```

## Running the Front-End

1. Using the Deployed Front-End

If you want to use the front-end that is hosted online, you can access it here:
https://saahiltakooree.github.io/LearnEase/

In this case, the front-end will automatically work with the deployed backend.

2. Running the Front-End on Your Local Machine

To run the front-end, simply open index.html in any modern browser (Chrome, Edge, Firefox, etc.).

If you are running the backend locally, make sure the backend server is started before loading index.html.