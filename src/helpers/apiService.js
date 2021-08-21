import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/?image_type=photo&orientation=horizontal';

function getPictures(query, page) {
  return axios.get(`${query}&page=${page}&per_page=12&key=15900106-2c235e732bb321ca7ec900d93`);
}

export default getPictures;