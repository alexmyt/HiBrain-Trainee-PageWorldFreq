/* eslint-disable no-undef */
import { expect } from 'chai';

// eslint-disable-next-line import/no-unresolved, import/extensions
import Parser from '../src/utils/parser';

describe('Parser', () => {
  it('must load page text', async () => {
    const page = await Parser.getPage('https://ya.ru/');
    expect(page).to.be.a('string').with.length.gt(0);
  });

  const testPages = [
    {
      lang: 'En',
      text: `<html><body><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
      <p>Vestibulum vulputate mauris nunc, non aliquam nisi facilisis et.</p> 
      <p>Nullam sit amet condimentum magna. Sed eget vulputate elit, non porta nisi.</p> 
      <p>Vestibulum quis orci ut leo vulputate sodales sit amet vel risus.</p> 
      <p>Pellentesque at risus posuere, consectetur nisi sed, sodales mi. Etiam.</p></body></html>`,
    },
    {
      lang: 'Ru',
      text: `<html><body><<p>Санкт-Петербург Соображения высшего порядка, а также новая модель организационной деятельности напрямую зависит от всесторонне 
      сбалансированных нововведений. Таким образом, дальнейшее развитие различных форм деятельности требует от нас анализа 
      системы масштабного изменения ряда параметров.</p>
      <p>Значимость этих проблем настолько очевидна, что дальнейшее развитие различных форм деятельности создаёт предпосылки 
      качественно новых шагов для соответствующих условий...</p></body></html>`,
    },
  ];

  testPages.forEach((page) => {
    it(`must count page word for language ${page.lang}`, () => {
      const parser = new Parser();
      const wordCounters = parser.getWordCounters(page.text);
      expect(wordCounters).to.be.an('object');
    });
  });

  it('must collect statistic of word frequency', () => {
    const parser = new Parser();
    const wordCounters = {
      Lorem: 1, ipsum: 1, dolor: 1, amet: 3, elit: 2, Vestibulum: 2,
    };
    const wordStatistic = parser.getWordStatistic(wordCounters);

    expect(wordStatistic).to.be.an('array').with.length(3);
    expect(wordStatistic[0]).to.have.property('count').that.eq(3);
    expect(wordStatistic[0]).to.have.property('words').that.eql(['amet']);

    expect(wordStatistic[1]).to.have.property('count').that.eq(2);
    expect(wordStatistic[1]).to.have.property('words').that.eql(['elit', 'Vestibulum']);

    expect(wordStatistic[2]).to.have.property('count').that.eq(1);
    expect(wordStatistic[2]).to.have.property('words').that.eql(['Lorem', 'ipsum', 'dolor']);
  });

  it('must fetch page and collect statistic of word frequency', async () => {
    const parser = new Parser();
    const pageStatistic = await parser.getPageStatistics('https://hibrain.ru/');

    expect(pageStatistic).to.be.an('object');
    expect(pageStatistic).to.have.property('url');
    expect(pageStatistic).to.have.property('wordFrequency').that.be.an('array');
  });

  it('must create PDF page', () => {
    const parser = new Parser();
    const wordCounters = {
      Lorem: 1, ipsum: 1, dolor: 1, amet: 3, elit: 2, Vestibulum: 2,
    };
    const wordStatistic = parser.getWordStatistic(wordCounters);

    const url = 'test';
    const pdf = parser.getWordFrequencyReport([{ url, wordFrequency: wordStatistic }]);
    expect(pdf).to.be.an('object');
  });
});
