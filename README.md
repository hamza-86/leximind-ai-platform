# LexiMindd - Legal Case Search Application

A Flask-based web application for searching and analyzing Indian legal cases using machine learning and AI.

## Features

- **Legal Case Search**: Search through a database of Indian legal cases
- **PDF Upload & Analysis**: Upload PDF documents for analysis
- **AI-Powered Explanations**: Get simple explanations of legal concepts using Gemini AI
- **Semantic Search**: Find relevant cases using advanced embeddings
- **Category Prediction**: Automatically categorize legal documents
- **Interactive Chat**: Ask questions about specific legal cases

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/moinkhanjsx/leximind.git
   cd leximind
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   - Copy `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Open your browser**:
   Navigate to `http://localhost:7860`

## Architecture

- **Backend**: Flask web application
- **ML Models**: Downloaded from Google Drive at runtime
- **AI Integration**: Google Gemini API for legal explanations
- **Frontend**: HTML, CSS, JavaScript
- **File Processing**: PDF text extraction and analysis

## ML Models

The application downloads the following ML models from Google Drive:
- Legal case embeddings
- Case name mappings
- Judgment text database
- Category prediction model
- Model logging data

## API Endpoints

- `/` - Main search interface
- `/chat` - Chatbot for legal explanations
- `/test-api` - Test Gemini API connectivity

## Technologies Used

- Python Flask
- Google Gemini AI
- Sentence Transformers
- PDF processing libraries
- Google Drive integration
- Bootstrap CSS framework

## License

This project is for educational and research purposes.