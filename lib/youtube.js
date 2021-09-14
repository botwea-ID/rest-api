const ytdl = require('ytdl-core');
const yts = require('yt-search');
const axios = require('axios');
const cheerio = require('cheerio')

function bytesToSize(bytes) {
    return new Promise((resolve, reject) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return 'n/a';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
        if (i === 0) resolve(`${bytes} ${sizes[i]}`);
        resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
    });
  };

function ytMp4(url) {
    return new Promise(async(resolve, reject) => {
        ytdl.getInfo(url).then(async(getUrl) => {
            let result = [];
            for(let i = 0; i < getUrl.formats.length; i++) {
                let item = getUrl.formats[i];
                if (item.container == 'mp4' && item.hasVideo == true && item.hasAudio == true) {
                    let { qualityLabel, contentLength } = item;
                    let bytes = await bytesToSize(contentLength);
                    result[i] = {
                        video: item.url,
                        quality: qualityLabel,
                        size: bytes
                    };
                };
            };
            let resultFix = result.filter(x => x.video != undefined && x.size != undefined && x.quality != undefined) 
            let tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`);
            let tinyUrl = tiny.data;
            let title = getUrl.videoDetails.title;
            let desc = getUrl.videoDetails.description;
            let views = getUrl.videoDetails.viewCount;
            let likes = getUrl.videoDetails.likes;
            let dislike = getUrl.videoDetails.dislikes;
            let channel = getUrl.videoDetails.ownerChannelName;
            let uploadDate = getUrl.videoDetails.uploadDate;
            let thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
            resolve({
                title,
                result: tinyUrl,
                quality: resultFix[0].quality,
                size: resultFix[0].size,
                thumb,
                views,
                likes,
                dislike,
                channel,
                uploadDate,
                desc
            });
        }).catch(reject);
    });
};

function ytMp3(url) {
    return new Promise((resolve, reject) => {
        ytdl.getInfo(url).then(async(getUrl) => {
            let result = [];
            for(let i = 0; i < getUrl.formats.length; i++) {
                let item = getUrl.formats[i];
                if (item.mimeType == 'audio/webm; codecs=\"opus\"') {
                    let { contentLength } = item;
                    let bytes = await bytesToSize(contentLength);
                    result[i] = {
                        audio: item.url,
                        size: bytes
                    };
                };
            };
            let resultFix = result.filter(x => x.audio != undefined && x.size != undefined) 
            let tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`);
            let tinyUrl = tiny.data;
            let title = getUrl.videoDetails.title;
            let desc = getUrl.videoDetails.description;
            let views = getUrl.videoDetails.viewCount;
            let likes = getUrl.videoDetails.likes;
            let dislike = getUrl.videoDetails.dislikes;
            let channel = getUrl.videoDetails.ownerChannelName;
            let uploadDate = getUrl.videoDetails.uploadDate;
            let thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
            resolve({
                title,
                result: tinyUrl,
                size: resultFix[0].size,
                thumb,
                views,
                likes,
                dislike,
                channel,
                uploadDate,
                desc
            });
        }).catch(reject);
    });
}

function ytPlay(query) {
    return new Promise((resolve, reject) => {
        yts(query).then(async(getData) => {
            let result = getData.videos.slice( 0, 5 );
            let url = [];
            for (let i = 0; i < result.length; i++) {
                url.push(result[i].url);
            }
            let random = url[Math.floor(Math.random() * url.length)];
            let getAudio = await ytMp3(random);
            resolve(getAudio);
        }).catch(reject);
    });
};

async function Tiktokdl (Url) {
	return new Promise (async (resolve, reject) => {
		await axios.request({
			url: "https://ttdownloader.com/",
			method: "GET",
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "en-US,en;q=0.9,id;q=0.8",
				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
				"cookie": "_ga=GA1.2.1240046717.1620835673; PHPSESSID=i14curq5t8omcljj1hlle52762; popCookie=1; _gid=GA1.2.1936694796.1623913934"
			}
		}).then(respon => {
			const $ = cheerio.load(respon.data)
			const token = $('#token').attr('value')
			axios({
				url: "https://ttdownloader.com/req/",
				method: "POST",
				data: new URLSearchParams(Object.entries({url: Url, format: "", token: token})),
				headers: {
					"accept": "*/*",
					"accept-language": "en-US,en;q=0.9,id;q=0.8",
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
					"cookie": "_ga=GA1.2.1240046717.1620835673; PHPSESSID=i14curq5t8omcljj1hlle52762; popCookie=1; _gid=GA1.2.1936694796.1623913934"
				}
			}).then(res => {
				const ch = cheerio.load(res.data)
				const result = {
						nowatermark: ch('#results-list > div:nth-child(2)').find('div.download > a').attr('href'),
						watermark: ch('#results-list > div:nth-child(3)').find('div.download > a').attr('href'),
						audio: ch('#results-list > div:nth-child(4)').find(' div.download > a').attr('href')
					}
				resolve(result)
			}).catch(reject)
		}).catch(reject)
	})
}

module.exports = { ytMp4, ytMp3, ytPlay,Tiktokdl };
