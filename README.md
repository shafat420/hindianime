# AnimeWorld API

A powerful and efficient API for scraping anime information from AnimeWorld. Built with Node.js and Express, optimized for Vercel deployment.

## 🚀 Features

- Fast and reliable anime scraping
- Multiple language support (Japanese, English, Hindi)
- Episode information retrieval
- Streaming sources with quality options
- Built-in subtitle support
- Rate limiting and security features
- CORS enabled
- Production-ready with Vercel deployment

## 🛠️ Tech Stack

- Node.js
- Express.js
- Axios
- Cheerio
- Express Rate Limit
- Helmet (Security)
- Morgan (Logging)

## 📝 API Endpoints

### Base URL
```
https://your-vercel-deployment.vercel.app
```

### Available Endpoints

#### 1. Health Check
```http
GET /
```
Returns API status and available endpoints.

#### 2. Search Anime
```http
GET /api/search?q={search_query}
```
Search for anime by title.

#### 3. Get Episodes
```http
GET /api/episodes?url={anime_url}
```
Retrieve episode list for a specific anime.

#### 4. Get Streaming Sources
```http
GET /api/stream?url={episode_url}
```
Get streaming sources and subtitles for an episode.

## 🚀 Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/animeworld-api.git
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

### Environment Variables

Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
```

## 📦 Deployment

This API is optimized for Vercel deployment. To deploy:

1. Install Vercel CLI
```bash
npm install -g vercel
```

2. Login to Vercel
```bash
vercel login
```

3. Deploy
```bash
vercel
```

## 🔒 Security

- Rate limiting enabled (100 requests per 15 minutes)
- Helmet security headers
- CORS protection
- XSS protection
- Content Security Policy

## ⚠️ Disclaimer

This API is for educational purposes only. Please ensure you comply with AnimeWorld's terms of service and your local regulations when using this API.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/animeworld-api](https://github.com/yourusername/animeworld-api)

---
Made with ❤️ by [Your Name]
