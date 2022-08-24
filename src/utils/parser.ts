import axios from 'axios';
import html2text from 'html-to-text';
import PDFDocument from 'pdfkit';

interface ParserOptions {
  /**
   * Minimum word length for word frequency counter
   * Default is 4
   *
   * @type {number}
   * @memberof ParserOptions
   */
  minChars: number,

  /**
   * Maximum words in word frequency counter
   *
   * @type {number}
   * @memberof ParserOptions
   */
  maxWords: number,
}

const defaultParserOptions: ParserOptions = {
  minChars: 4,
  maxWords: 3,
};

type WordCounters = {[index: string]: number};
type WordFrequency = {count: number, words: string[]}[];
type PageStatistic = { url: string, title?: string, wordFrequency: WordFrequency };
type RequestStatistics = PageStatistic[];

export default class Parser {
  parserOptions: ParserOptions;

  constructor(options: Partial<ParserOptions> = {}) {
    this.parserOptions = {
      ...defaultParserOptions,
      ...options,
    };
  }

  /**
   * Returns array withs words, grouped by frequency of usage
   * Example [{count: 5, words: ['word1','word3']}, count: 3, words: ['word2']]
   *
   * @param {WordCounters} wordCounters
   * @return {WordFrequency}
   * @memberof Parser
   */
  getWordStatistic(wordCounters: WordCounters): WordFrequency {
    const statistic: WordFrequency = [];

    Object.keys(wordCounters).forEach((word) => {
      const wordCount = wordCounters[word];
      const element = statistic.find((el) => el.count === wordCount);
      if (element) {
        element.words.push(word);
      } else {
        statistic.push({ count: wordCount, words: [word] });
      }
    });

    return statistic
      .sort((a, b) => b.count - a.count)
      .slice(0, this.parserOptions.maxWords);
  }

  /**
   * Returns object with words counters
   * Example: { 'word1': 5, 'word2': 3 }
   *
   * @param {string} page HTML page
   * @return {WordCounters}
   * @memberof Parser
   */
  getWordCounters(page: string): WordCounters {
    const text = html2text.convert(
      page,
      {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true, hideLinkHrefIfSameAsText: true } },
          { selector: '*[style="display:none"]', format: 'skip' },
          { selector: 'img', format: 'skip' },
        ],
      },
    );

    const wordCounters: WordCounters = {};

    // Regular expresion for split string to words
    const splitRegExp = /[-\wА-ЯЁа-яё\d]+/g;
    [...text.matchAll(splitRegExp)]
      .filter((el) => el[0].length >= this.parserOptions.minChars)
      .forEach((el) => {
        const word = el[0];
        if (wordCounters[word]) {
          wordCounters[word] += 1;
        } else {
          wordCounters[word] = 1;
        }
      });

    return wordCounters;
  }

  static async getPage(url:string) {
    const { data } = await axios.get(url);
    return data;
  }

  /**
   * Fetch page by URL and collect words statistic
   *
   * @param {string} url
   * @return {*}  {Promise<PageStatistic>}
   * @memberof Parser
   */
  async getPageStatistics(url: string): Promise<PageStatistic> {
    const page = await Parser.getPage(url);
    const wordCounters = this.getWordCounters(page);
    const wordFrequency = this.getWordStatistic(wordCounters);

    return { url, wordFrequency };
  }

  /**
   * Create PDF file with request results
   *
   * @export
   * @param {RequestStatistics} stats
   * @return {PDFKit.PDFDocument}
   */
  getWordFrequencyReport(
    stats: RequestStatistics,
  ) {
    const doc = new PDFDocument({ font: `${__dirname}/../../fonts/Roboto-Regular.ttf` });

    stats.forEach((element) => {
      doc
        .fillColor('blue')
        .fontSize(18)
        .text(element.url, { link: element.url, underline: true, paragraphGap: 2 })
        .fillColor('black')
        .fontSize(14);

      const plainWordArray = element.wordFrequency
        .map((el) => {
          el.words.sort((a, b) => a.localeCompare(b));
          return el.words;
        })
        .flat()
        .slice(0, this.parserOptions.maxWords);

      doc.text(plainWordArray.join(' | '), { paragraphGap: 6 });
      doc.moveDown();

      // element.wordFrequency.forEach((el) => {
      //   doc.text(el.words.join(','));
      // });
    });

    doc.end();

    return doc;
  }
}
