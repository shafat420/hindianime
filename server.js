const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const AnimeWorld = require('./animeWorld');

const app = express();
const PORT = process.env.PORT || 3000;
const scraper = new AnimeWorld();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        data: {
            message: 'AnimeWorld API is running',
            endpoints: {
                search: '/api/search?q=query',
                episodes: '/api/episodes?url=animeUrl',
                stream: '/api/stream?url=episodeUrl'
            }
        }
    });
});

app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                status: 'error',
                data: {
                    message: 'Query parameter "q" is required'
                }
            });
        }

        const results = await scraper.scrapeSearchResults(q);
        res.json({
            status: 'success',
            data: {
                results: results
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            status: 'error',
            data: {
                message: 'Failed to search anime'
            }
        });
    }
});

app.get('/api/episodes', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: 'error',
                data: {
                    message: 'Query parameter "url" is required'
                }
            });
        }

        const episodes = await scraper.scrapeEpisodes(url);
        res.json({
            status: 'success',
            data: {
                info: episodes
            }
        });
    } catch (error) {
        console.error('Episodes error:', error);
        res.status(500).json({
            status: 'error',
            data: {
                message: 'Failed to fetch episodes'
            }
        });
    }
});

app.get('/api/stream', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: 'error',
                data: {
                    message: 'Query parameter "url" is required'
                }
            });
        }

        const streamData = await scraper.scrapeEpisodesSrcs(url);
        res.json({
            status: 'success',
            data: {
                sources: streamData.sources || [],
                tracks: streamData.tracks || []
            }
        });
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({
            status: 'error',
            data: {
                message: 'Failed to fetch streaming sources'
            }
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        data: {
            message: 'Something went wrong!'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
