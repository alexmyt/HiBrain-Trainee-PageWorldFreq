"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const parser_1 = require("../src/utils/parser");
describe('Parser', () => {
    it('must load page text', async () => {
        const page = await (0, parser_1.getPage)('http://habrahabr.ru/');
        (0, chai_1.expect)(page).to.be.a('string').with.length.gt(0);
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
        it(`must count page words at language ${page.lang}`, () => {
            const wordStat = (0, parser_1.getWordFrequencyArray)(page.text);
            console.log(wordStat);
            (0, chai_1.expect)(wordStat).to.be.an('array').with.length(3);
        });
        it.only(`must create PDF page ${page.lang}`, () => {
            const wordStat = (0, parser_1.getWordFrequencyArray)(page.text);
            const stream = (0, parser_1.getWordFrequencyReport)(wordStat);
        });
    });
});
//# sourceMappingURL=parser.spec.js.map