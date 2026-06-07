# LexiMindd - Legal Case Search & AI Assistant
## Project Overview and Deployment Guide

LexiMindd is a production-ready, AI-powered Flask web application designed for legal professionals, researchers, and students. It integrates Machine Learning models for semantic similarity search and document classification, along with Large Language Models (LLMs) to facilitate real-time legal explanations and interactive document chat.

---

## Table of Contents
1. [What is LexiMindd?](#1-what-is-leximindd)
2. [Key Features & Functionality](#2-key-features--functionality)
3. [System Architecture & ML Models](#3-system-architecture--ml-models)
4. [How to Run the Project Locally](#4-how-to-run-the-project-locally)
5. [Live Deployment Guide](#5-live-deployment-guide)
   - [Option A: Hugging Face Spaces (Recommended & Free)](#option-a-hugging-face-spaces-recommended--free)
   - [Option B: Render Deployment](#option-b-render-deployment)
   - [Option C: Railway Deployment](#option-c-railway-deployment)

---

## 1. What is LexiMindd?

LexiMindd is an intelligent legal assistant that bridges the gap between complex legal documents and plain language. By combining natural language processing (NLP) and vector embeddings, the application lets users query Indian court judgments, automatically categorize cases, and chat with an AI assistant that reads court judgments and answers queries directly using Google Gemini AI.

---

## 2. Key Features & Functionality

*   **Legal Case Semantic Search:**
    Rather than relying on exact keyword matching, LexiMindd translates queries into high-dimensional vectors. It compares query vectors against a pre-computed database of judgment embeddings and retrieves the top 5 most semantically relevant legal cases.
*   **Automatic Case Categorization:**
    Using a pre-trained scikit-learn text classifier, LexiMindd analyzes case text or judgment files and predicts the judicial category (e.g., criminal, taxation, civil, constitutional, etc.) with high accuracy.
*   **PDF Document Processing:**
    Users can paste raw text or upload court judgment PDFs directly. The application uses `pdfplumber` and `PyPDF2` to extract text in-memory (safely, without persisting uploaded files to disk).
*   **RAG-powered AI Legal Chatbot:**
    After retrieving relevant judgments or uploading a case file, users can ask questions (e.g., *"What is the main issue in this case?"*, *"Explain this like a layman"*). The chatbot extracts context and prompts Google's Gemini AI to deliver structured responses complete with section headers, citations, and bullet points.
*   **Polished User Interface:**
    A fully responsive, elegant dashboard built with custom styling. Features include:
    *   Smooth transitions and micro-animations.
    *   Full dark/light mode toggle.
    *   Expandable search results previews.
    *   Interactive skeleton loaders and progress trackers.

---

## 3. System Architecture & ML Models

The backend is built in **Python (Flask)**, while the frontend is managed using native **HTML, Vanilla CSS, and JavaScript**. 

The application utilizes local pre-trained ML assets that are loaded into memory:
1.  `model.pkl`: A SentenceTransformer embedding model (`all-MiniLM-L6-v2`) used to compute sentence/paragraph vectors.
2.  `embeddings.pkl`: High-dimensional vector embeddings for the judgment database.
3.  `judgment_texts.pkl`: The raw text database containing court judgments.
4.  `case_names.pkl`: Case identifiers and citations mapped to indices.
5.  `modellog.pkl`: The scikit-learn classifier pipeline for document categorization.

> [!NOTE]
> The app is built with **Lazy Loading**. The heavyweight ML models and the Gemini API are only loaded/configured when a user submits a query. This ensures fast server startups, lower memory consumption, and robust error handling.

---

## 4. How to Run the Project Locally

Follow these steps to run the application on your computer:

### Step 1: Open the Project Directory
Open your terminal (PowerShell, Command Prompt, or Bash) and navigate to the project directory:
```bash
cd "c:\Users\hamza\Desktop\LexiMindd-main working"
```

### Step 2: Activate the Virtual Environment
The project includes pre-configured virtual environments. It is highly recommended to use the `venv` folder where dependencies are already installed:

*   **Windows (PowerShell):**
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
*   **Windows (Command Prompt):**
    ```cmd
    .\venv\Scripts\activate.bat
    ```
*   **macOS / Linux:**
    ```bash
    source venv/bin/activate
    ```

### Step 3: Install/Verify Dependencies
Verify that all packages are up to date:
```bash
pip install -r requirements.txt
```

### Step 4: Configure the Gemini API Key
The AI Chatbot requires a Google Gemini API Key.
1.  Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2.  In the project folder, rename `.env.example` to `.env` (or create a new file named `.env`).
3.  Add your key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

### Step 5: Start the Application
Run the Flask server:
```bash
python app.py
```

You will see output indicating the server is running:
`* Running on http://127.0.0.1:7860`

### Step 6: Access the App
Open your web browser and go to:
**`http://127.0.0.1:7860`**

---

## 5. Live Deployment Guide

Here are the step-by-step instructions to make the project live on the internet:

### Option A: Hugging Face Spaces (Recommended & Free)
Hugging Face Spaces is the easiest platform to deploy this app because it supports Python environments for free and has dedicated resources for machine learning weights.

1.  **Create a Hugging Face Account:** Sign up at [huggingface.co](https://huggingface.co/).
2.  **Create a New Space:**
    *   Click **New Space** in your profile menu.
    *   Choose a name (e.g., `leximind`).
    *   Select **Docker** as the SDK (or **Gradio** and configure it to run a custom python server).
    *   Select **Blank** template or **Docker -> Flask**.
    *   Set the space to **Public** or **Private**.
3.  **Upload the Code Files:**
    You can upload files directly through the Hugging Face web interface or using Git:
    *   Upload `app.py`, `requirements.txt`, `templates/`, `static/`, and the `.pkl` files.
    *   *Note:* Because the pickle files are large, Git LFS (Large File Storage) is recommended if pushing via Git. Alternatively, the app is programmed to download the models automatically from Google Drive if they are missing from the repository, which keeps your repository small!
4.  **Set Environment Variables:**
    *   Go to your Space's **Settings** tab.
    *   Scroll to **Variables and secrets**.
    *   Add a new Secret:
        *   **Name:** `GEMINI_API_KEY`
        *   **Value:** *Your Google Gemini API Key*
5.  **Build and Run:**
    *   Hugging Face will automatically detect the Python files and build the container.
    *   Once building completes, the Space will display "Running" and your application will be live at `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`.

---

### Option B: Render Deployment
Render is a developer-friendly cloud platform that supports web apps out-of-the-box.

1.  **Create a Render Account:** Sign up at [render.com](https://render.com/).
2.  **Push Code to GitHub:**
    *   Create a private or public repository on GitHub.
    *   Commit all code files (exclude the `.pkl` files if they exceed GitHub's file size limit; the application will download them automatically from Google Drive on startup).
    *   Push your code.
3.  **Create a Web Service on Render:**
    *   Click **New +** on Render and choose **Web Service**.
    *   Connect your GitHub repository.
4.  **Configure Service Details:**
    *   **Runtime:** `Python`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `gunicorn app:app` (Render reads this from the `Procfile`)
5.  **Add Environment Variables:**
    *   Under **Advanced**, click **Add Environment Variable**.
    *   Add `GEMINI_API_KEY` with your Gemini API Key.
6.  **Deploy:**
    *   Click **Create Web Service**. Render will build and deploy the app.
    *   You will receive a live URL like `https://leximind.onrender.com`.

---

### Option C: Railway Deployment
Railway offers instant hosting with very little configuration.

1.  **Sign Up on Railway:** Connect your GitHub account at [railway.app](https://railway.app/).
2.  **Create a New Project:**
    *   Click **New Project** -> **Deploy from GitHub repo**.
    *   Select your LexiMind repository.
3.  **Configure Environment Variables:**
    *   Go to the **Variables** tab of the service.
    *   Add `GEMINI_API_KEY` and set its value.
4.  **Deploy:**
    *   Railway will read the `Procfile` (`web: gunicorn app:app`) and automatically deploy.
    *   Go to **Settings** -> **Public Networking** -> click **Generate Domain** to get your public live link.
