import * as cheerio from 'cheerio';
import axios from 'axios';
import { isBefore } from 'date-fns';

import { Logger } from '../../util/logger';
import { util_dateTimeToUTC } from '../../util/dateTimeToUTC';
import { TWITTER_SOURCES } from './sources';

export interface IRecentNewsSource {
    name: string;
    username: string;
    verified: boolean;
    lastActivityTime: string;
    tweets: ITweet[];
    platform: string;
}

interface ITweet {
    content: string;
    id: string;
    time: string;
}

export class RecentNewsService {
    runTimes: number | boolean;
    delay: number;
    totalSourcesScanned: number;
    totalTweetsScanned: number;

    constructor({ runTimes, delay }: { runTimes: number; delay: number }) {
        this.runTimes = runTimes;
        this.delay = delay;
        this.totalSourcesScanned = 0;
        this.totalTweetsScanned = 0;
    }

    async run() {
        let recentNews: IRecentNewsSource[] = [];

        while (this.runTimes) {
            let startTime = Logger.time();

            this.totalSourcesScanned = 0;
            this.totalTweetsScanned = 0;

            try {
                recentNews = await this.fetchRecentNews(TWITTER_SOURCES);
            } catch (e) {
                console.log('Error in RecentNewsService run:', e);
                return [];
            }

            Logger.logRuntime('Recent News Scan completed in', startTime);
            console.log('Total Recent News Sources:', this.totalSourcesScanned);
            console.log('Total News Posts:', this.totalTweetsScanned);

            if (typeof this.runTimes === 'number') this.runTimes--;
        }

        return recentNews;
    }

    async fetchRecentNews(TWITTER_SOURCES: string[]) {
        try {
            const promises: Promise<IRecentNewsSource>[] = [];
            await TWITTER_SOURCES.forEach(TWITTER_SOURCE => {
                promises.push(
                    new Promise((resolve, reject) =>
                        this.fetchSource(TWITTER_SOURCE).then(response => resolve(response))
                    )
                );
            });
            return await Promise.all(promises).then(response => response);
        } catch (e) {
            console.log('Error in RecentNewsService fetchRecentNews:', e);
            return [];
        }
    }

    async fetchSource(TWITTER_SOURCE: string): Promise<IRecentNewsSource> {
        const BASE_URI = 'https://twitter.com/';
        const URL = `${BASE_URI}/${TWITTER_SOURCE}`;

        try {
            const $: CheerioStatic = await axios
                .get(URL)
                .then(response => cheerio.load(response.data))
                .catch(err => err);
            const _tweets = $('#timeline .stream .stream-items .stream-item .content');

            let tweets: ITweet[] = [];

            this.totalSourcesScanned++;

            _tweets.each((i, elem) => {
                this.totalTweetsScanned++;

                const id = $(elem)
                    .find('.stream-item-header .time .tweet-timestamp')
                    .attr('data-conversation-id');
                const dateStr = $(elem)
                    .find('.stream-item-header .time .tweet-timestamp')
                    .attr('title');
                const content = $(elem)
                    .find('.js-tweet-text-container .TweetTextSize')
                    .text();

                if (dateStr && content) {
                    tweets.push({
                        id,
                        time: util_dateTimeToUTC(dateStr),
                        content
                    });
                }
            });

            // sorts tweet list into descending order (latest first);
            tweets = tweets.sort((a, b) => {
                if (isBefore(new Date(a.time), new Date(b.time))) return 1;
                if (isBefore(new Date(b.time), new Date(a.time))) return -1;
                return 0;
            });

            return {
                name: $('.ProfileHeaderCard-name')
                    .children()
                    .first()
                    .text(),
                username: $('.ProfileHeaderCard-screenname a span').text(),
                verified: $('.ProfileHeaderCard-name').children().length > 1,
                lastActivityTime: tweets[0].time,
                tweets,
                platform: 'twitter'
            } as IRecentNewsSource;
        } catch (e) {
            console.log('Error in RecentNewsService:', e);
            return e;
        }
    }
}
