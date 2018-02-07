import runner from './runner';

async function quilted(url, options) {
  return await runner(url, options);
}

export default quilted;