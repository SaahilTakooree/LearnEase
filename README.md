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

## Configuration

The API base URL is defined inside javascript/main.js:

API base URL
```vue.js
base_url: "https://learnease-backend-rjr2.onrender.com",
```
### Using Local Backend

If you want to run your backend locally instead of using Render:

By default, when running the backend locally, it uses port 6969. If your backend runs on a different port, update the base URL in main.js like this:
```vue.js

base_url: "http://localhost:{your-port}",
```

## Running the Front-End (Locally)

To run the front-end, simply open index.html in any modern browser (Chrome, Edge, Firefox, etc.).

If you are running the backend locally, make sure the backend server is started before loading index.html.