import Hapi from '@hapi/hapi';
import Joi from 'joi';

// eslint-disable-next-line import/no-unresolved, import/extensions
import Parser from '../utils/parser';

/**
 * Create PDF file with most frequently used words at web pages
 *
 * @param {Hapi.Request} request
 * @param {Hapi.ResponseToolkit} h
 * @return {Promise<Hapi.ResponseObject>}
 */
async function getFrequencyHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
): Promise<Hapi.ResponseObject> {
  const urls: string[] = Array.isArray(request.query.url)
    ? [...request.query.url] : [request.query.url];

  const parser = new Parser();
  const statistics = await Promise.all(urls.map((url) => parser.getPageStatistics(url)));
  const pdf = parser.getWordFrequencyReport(statistics);

  return h.response(pdf).header('Content-Disposition', 'attachment; filename=report.pdf');
}

const URISchema = Joi.string().uri().example('https://test.com');
// const getRequestSchema = Joi.alternatives(
//   Joi.object({ url: URISchema }),
//   Joi.object({ url: Joi.array().items(URISchema) }),
// );
const getRequestSchema = Joi.object({ url: Joi.array().items(URISchema).required().single() });

const taskPlugin = {
  name: 'app/task',
  async register(server: Hapi.Server) {
    server.route([
      {
        method: 'GET',
        path: '/getFrequency',
        options: {
          handler: getFrequencyHandler,
          validate: {
            query: getRequestSchema,
            failAction: (request, h, err) => { throw err; },
          },
        },
      },
    ]);
  },
};

export default taskPlugin;
