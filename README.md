# HealWise - Your AI Companion for Emotional Wellness

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Pg1910/healwise)

**🤖 Try HealWise Live**: [https://healwise-demo.vercel.app](https://healwise-demo.vercel.app) *(Will be updated after deployment)*

**📚 View Code**: [https://github.com/Pg1910/healwise](https://github.com/Pg1910/healwise)

---

## 🌟 What is HealWise?

HealWise is a compassionate AI-powered mental health companion that provides real-time emotional support, crisis assessment, and personalized wellness recommendations through a warm, chat-based interface.

### ✨ Key Features
- **Real-time Emotion Analysis** using HuggingFace's roberta-base-go_emotions model
- **Crisis Detection & Support** with multi-layered safety assessment
- **Personalized Recommendations** for movies, books, exercises, and wellness activities
- **Warm Companion UI** designed to feel like chatting with a caring friend
- **Privacy-First** with local LLM processing via Ollama

---

## 🚀 Live Demo

**Try it now**: [https://healwise-demo.vercel.app](https://healwise-demo.vercel.app)

*Experience HealWise's companion-style interface that encourages emotional expression and provides supportive, personalized guidance.*

---

## 🛠️ Tech Stack

**Frontend**: React + Vite + Tailwind CSS  
**Backend**: FastAPI + Python  
**AI/ML**: HuggingFace Transformers + Ollama/Mistral  
**Deployment**: Vercel (Frontend) + Railway (Backend)

---

## 💡 Inspiration

Mental health support shouldn't wait for business hours or depend on having the "right" person available. HealWise bridges that gap by providing compassionate, AI-powered emotional support that's available 24/7.

---

## 🏗️ Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- Ollama (for local LLM)

### Setup
```bash
# Clone the repository
git clone https://github.com/Pg1910/healwise.git
cd healwise

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
pip install fastapi uvicorn

# Start Ollama and pull Mistral
ollama pull mistral

# Run backend
uvicorn app:app --reload

# Run frontend (in new terminal)
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see HealWise in action!

---

## 📖 How It Works

1. **Express Yourself**: Share your thoughts in our warm, judgment-free chat interface
2. **AI Analysis**: Advanced emotion detection understands your emotional state
3. **Safety Assessment**: Multi-layered crisis detection ensures appropriate support level
4. **Personalized Care**: Receive tailored suggestions, resources, and next steps
5. **Continuous Support**: Available 24/7 with no appointment needed

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Crisis Resources

If you're in crisis, please reach out immediately:
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988
- **Emergency Services**: 911

---

*HealWise - Where healing conversations begin* 💚
