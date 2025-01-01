const axios = require('axios');
const cheerio = require('cheerio');

// Custom axios instance with headers
const client = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'referer': 'https://anime-world.in/'
    },
    timeout: 10000,
    maxRedirects: 5,
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    }
});

class AnimeWorld {
    constructor() {
        this.sourceName = 'AnimeWorld';
        this.isMulti = true;
    }

    getWatchUrl(title, episode = '1') {
        // Convert title to the correct format: lowercase, spaces to dashes
        const formattedTitle = title.toLowerCase()
            .replace(/\s+/g, '-')  // Replace spaces with dashes
            .replace(/[^a-z0-9-]/g, '')  // Remove special characters except dashes
            .replace(/-+/g, '-');  // Replace multiple dashes with single dash

        // Always add the episode suffix
        const slug = `${formattedTitle}-8211-episode-${episode}`;
        
        // Available languages
        const languages = ['japanese', 'english', 'hindi'];
        
        // Generate URLs for each language
        return languages.map(lang => ({
            url: `https://beta.awstream.net/watch?v=${slug}&lang=${lang}`,
            type: 'iframe',
            quality: `beta.awstream (${lang})`
        }));
    }

    async scrapeEpisodesSrcs(url, { lang = null, category = null, server = null } = {}) {
        try {
            console.log('Fetching source for URL:', url);
            
            // Get the episode page
            const response = await client.get(url, {
                headers: {
                    'referer': 'https://anime-world.in/',
                }
            });

            // Parse the HTML
            const $ = cheerio.load(response.data);
            
            // Look for the video ID in script tags
            let videoId = null;
            $('script').each((_, script) => {
                const content = $(script).html() || '';
                const idMatch = content.match(/sniff\(\s*"[^"]+",\s*"([a-f0-9]{32})"/);
                if (idMatch) {
                    videoId = idMatch[1];
                    return false; // break the loop
                }
            });

            if (videoId) {
                console.log('Found video ID:', videoId);

                // Construct the HLS URL
                const m3u8Url = `https://beta.awstream.net/m3u8/${videoId}/master.txt?s=1&lang=${lang || 'hindi'}&cache=1`;
                const tracksUrl = `https://beta.awstream.net/subs/m3u8/${videoId}/subtitles-eng.vtt`;
                
                console.log('Generated m3u8 URL:', m3u8Url);

                return {
                    sources: [
                        {
                            url: `https://m3u8-ryan.vercel.app/api/convert?url=${encodeURIComponent(m3u8Url)}`,
                            type: 'hls'
                        }
                    ],
                    tracks: [
                        {
                            label: 'English',
                            file: tracksUrl,
                            kind: 'captions'
                        }
                    ]
                };
            }

            // If video ID not found in scripts, try the embed URL approach
            // Extract series name and episode number from URL
            const urlPath = url.split('/').filter(Boolean).pop().replace(/\/$/, '');
            const match = urlPath.match(/^(.*?)-(\d+)x(\d+)$/);
            
            if (!match) {
                throw new Error('Invalid episode URL format');
            }

            const [, seriesName, , episodeNum] = match;
            console.log('Series:', seriesName, 'Episode:', episodeNum);

            // Construct the embed URL with correct format
            const embedSlug = `${seriesName}-8211-episode-${episodeNum}`;
            const embedUrl = `https://beta.awstream.net/watch?v=${embedSlug}&lang=${lang || 'hindi'}`;
            console.log('Trying embed URL:', embedUrl);

            const embedResponse = await client.get(embedUrl, {
                headers: {
                    'referer': url
                }
            });

            const embedHtml = embedResponse.data;
            const embedIdMatch = embedHtml.match(/sniff\(\s*"[^"]+",\s*"([a-f0-9]{32})"/);

            if (embedIdMatch) {
                videoId = embedIdMatch[1];
                console.log('Found video ID from embed:', videoId);

                // Construct the HLS URL
                const m3u8Url = `https://beta.awstream.net/m3u8/${videoId}/master.txt?s=1&lang=${lang || 'hindi'}&cache=1`;
                const tracksUrl = `https://beta.awstream.net/subs/m3u8/${videoId}/subtitles-eng.vtt`;
                
                console.log('Generated m3u8 URL:', m3u8Url);

                return {
                    sources: [
                        {
                            url: `https://m3u8-ryan.vercel.app/api/convert?url=${encodeURIComponent(m3u8Url)}`,
                            type: 'hls'
                        }
                    ],
                    tracks: [
                        {
                            label: 'English',
                            file: tracksUrl,
                            kind: 'captions'
                        }
                    ]
                };
            }

            throw new Error('Could not find video ID');

        } catch (error) {
            console.error('Error in scrapeEpisodesSrcs:', error.message);
            console.error('Error stack:', error.stack);
            return { sources: [], tracks: [] };
        }
    }

    async scrapeEpisodes(url, { args = null } = {}) {
        try {
            const response = await client.get(url);
            if (response.status === 200) {
                const $ = cheerio.load(response.data);
                
                const title = $('.entry-title').text().trim();
                const availLanguages = [];
                $('.loadactor a').each((_, lang) => availLanguages.push($(lang).text()));
                const moreThanOneSeason = $('.sel-temp a').length > 1;

                const episodes = $('#episode_by_temp li').map((_, episode) => {
                    const $episode = $(episode);
                    const id = $('.lnk-blk').attr('href');
                    const title = $episode.find('.entry-title').text();
                    let image = $episode.find('img').attr('src');
                    const number = $episode.find('.num-epi').text().split('x').pop();

                    if (image && image.startsWith('//')) {
                        image = 'https:' + image;
                    }

                    return {
                        episodeId: id,
                        title: title,
                        image: image,
                        number: parseInt(number)
                    };
                }).get();

                return {
                    id: url,
                    title: title,
                    episodes: episodes,
                    totalEpisodes: episodes.length
                };
            }
        } catch (error) {
            console.error('Error scraping episodes:', error);
        }
        return {};
    }

    async scrapeSearchResults(query) {
        try {
            const url = `https://anime-world.in/?s=${query}`;
            const response = await client.get(url);
            const searchData = [];

            if (response.status === 200) {
                const $ = cheerio.load(response.data);

                $('.post-lst li').each((_, card) => {
                    $(card).find('.vote span').remove();
                    searchData.push({
                        id: $(card).find('a').attr('href'),
                        name: $(card).find('.entry-title').text().trim(),
                        rating: $(card).find('.vote').text().trim(),
                        poster: 'https:' + $(card).find('img').attr('src')
                    });
                });
            }
            return searchData;
        } catch (error) {
            console.error('Error searching:', error);
            return [];
        }
    }
}

module.exports = AnimeWorld;
