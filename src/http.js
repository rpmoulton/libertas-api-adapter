import axios from 'axios';

// Never forward API keys, bearer tokens, or financial uploads through redirects.
export default axios.create({ maxRedirects: 0, timeout: 30000 });
