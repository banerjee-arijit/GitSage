<div align="center">
  <h1>GitSage</h1>
  <p><strong>Chat with any GitHub codebase. Powered by Spring AI & Gemini 3.6 Flash.</strong></p>
</div>

---

**GitSage** is a full-stack, AI-powered developer tool that allows you to chat directly with your GitHub repositories. Using advanced RAG (Retrieval-Augmented Generation) and TF-IDF search, GitSage reads your codebase and provides incredibly accurate, context-aware answers to your technical questions.

## Features

- **GitHub OAuth Integration:** Securely log in with GitHub to instantly sync and access all your public and private repositories.
- **Explore Mode (Bypass Auth):** Search for any GitHub user globally and instantly browse their public repositories without needing to log in.
- **Smart Codebase RAG:** In-memory document storage paired with TF-IDF keyword ranking extracts the most relevant source files to answer your questions.
- **Powered by Gemini 3.6 Flash:** Deep code reasoning backed by Google's fastest Gemini model.
- **Bring Your Own Key (BYOK):** Production-ready. Users can provide their own Gemini API keys via a secure, privacy-guaranteed local storage modal.
- **Persistent Chat History:** Seamlessly pick up where you left off. All chat threads, messages, and file citations are persisted via MySQL.
- **Blazing Fast Frontend:** Built with React, Vite, and Tailwind CSS. Highly optimized with lazy-loaded code-splitting for near-instant initial page loads.

## Tech Stack

### Frontend (Client)
- React (Vite)
- TypeScript
- Tailwind CSS (Premium Cinematic UI)
- Lucide React (Icons)
- React Markdown (Code highlighting)

### Backend (Server)
- Java Spring Boot 3
- Spring AI (OpenAI Chat Client compatible with Gemini)
- Spring Security (OAuth2 Client)
- Spring Data JPA (Hibernate)
- MySQL Database

## Getting Started

### Prerequisites
- Node.js & npm (v18+)
- Java 17+
- Maven
- MySQL Server (running on port 3306)

### 1. Database Setup
Ensure MySQL is running and create a database named devlink (or whatever you configure).
\\\sql
CREATE DATABASE devlink;
\\\

### 2. Backend Setup
Navigate to the server directory and create an application.properties file:

\\\properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/devlink
spring.datasource.username=root
spring.datasource.password=yourpassword

# GitHub OAuth
spring.security.oauth2.client.registration.github.client-id=YOUR_GITHUB_CLIENT_ID
spring.security.oauth2.client.registration.github.client-secret=YOUR_GITHUB_CLIENT_SECRET

# Gemini (Spring AI OpenAI configuration)
spring.ai.openai.api-key=YOUR_GEMINI_API_KEY
spring.ai.openai.base-url=https://generativelanguage.googleapis.com/v1beta/openai
spring.ai.openai.chat.options.model=gemini-3.6-flash
\\\

Run the Spring Boot application:
\\\ash
cd server
./mvnw spring-boot:run
\\\
*The backend will run on http://localhost:8080.*

### 3. Frontend Setup
Navigate to the client directory:
\\\ash
cd client
npm install
npm run dev
\\\
*The frontend will run on http://localhost:5173.*

## Privacy & BYOK
GitSage respects user privacy. By default, the application allows users to inject their own Google Gemini API Key from the frontend Dashboard. This key is strictly stored in the browser's localStorage and sent via HTTP headers to authenticate requests, ensuring keys are never persisted in the database.

## License
This project is licensed under the MIT License.

