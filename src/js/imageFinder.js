import template from '../templates/imageCard.hbs';
import { searchForm, input, gallery, modalDiv, modalDivButton, modalImg, addPictures } from './refs';
import getPictures from '../helpers/apiService';
import { error, notice } from '@pnotify/core';

import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/src/styles/main.scss';

import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';


// объект значений которые будут использоваться для запросов
const state = {
  page: 1,
  query: '',
};

// вешаем слушатели событий
searchForm.addEventListener(`submit`, sendSubmit);
gallery.addEventListener(`click`, openModal);
addPictures.addEventListener(`click`, addNewPictures);
modalDiv.addEventListener(`click`, closeModalWindow);

// таргеты за которыми будем следить observer
const targets = document.getElementsByClassName('modal-img');
// настройки нашего observer
const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.5,
};

// Функция которая догружает изображения, когда срабатывает observer
const loadImage = function () {
  if (state.page > 1) {
    state.page += 1;
      getPictures(state.query, state.page).then(resp => {
        const data = resp.data.hits;
        //рендерим по шаблону картинки
        const markUp = template(data);
        //парсим markUp в gallery
        gallery.insertAdjacentHTML(`beforeend`, markUp);
    });
  }
};

// инициализируем объект observer
const observer = new IntersectionObserver(loadImage, options);
// говорим обзерверу следить за картинкой перебирая массив всех картинок
[...targets].forEach(target => {
  observer.observe(target);
});

// функция отправки сабмита
function sendSubmit(e) {
    //отмена перезагрузки страницы после отправки submita
    e.preventDefault();
    //картинок нет на странице
    gallery.innerHTML = '';
    //запром равен тому, что будет введено в форму submita
    state.query = `&q=${input.value}`;
    //кнопка load more скрыта, она прозрачная
    addPictures.style.visibility = `hidden`;
    //делаем fetch катинок с помощьб функции getPictures с параметрами query (запрос) и page (страница 1), ответ от бекенда приходит со свойствами data.hits
  getPictures(state.query, state.page).then(response => {
      const data = response.data.hits;
      //если длина ответа больше 1, тогда кнопка load more будет видна на странице
    if (data.length >= 1) {
        addPictures.style.visibility = `visible`;
        myNotice();
      };

    if (data.length === 0) {
        errorMessage('Sorry, nothing was found for your query! Try again!');
    };

     //рендерим по шаблону картинки 
      const markup = template(data);
     //парсим markUp в gallery 
     gallery.insertAdjacentHTML(`beforeend`, markup);
  }).catch(myNotice);
}

function errorMessage(message) {
    error ({
            title:`${message}`,
            delay: 2000,    
        });
}

function myNotice () {
        notice({
            text: 'Invalid entered search!',
            delay: 2000,
        });
}


// при клике на кнопку load more догружаются картинки, после того как один раз на нее кликнули срабатывает observer
function addNewPictures() {
  state.page += 1;
  getPictures(state.query, state.page).then(resp => {
    const data = resp.data.hits;
    const mark = template(data);
    gallery.insertAdjacentHTML(`beforeend`, mark);
  });
  addPictures.removeAttribute('style');
}

// Функция открытия модалки
function openModal(e) {
    //если кликунли не в картинку, то ничего не делаем
    if (e.target.nodeName !== 'IMG') {
        return;
    }
  document.addEventListener('keydown', closeByEscape);
  modalDiv.setAttribute(`class`, 'lightbox__overlay');
  modalDivButton.setAttribute(`class`, 'lightbox__button');
  modalImg.setAttribute(`src`, `${e.target.src}`);
}

// функция закрытия модалки по Escape
function closeByEscape(e) {
    //   if (e.key !== `Escape`) {
    //     return;
    //     }
    // closeModalWindow();
    
    //или
    if (e.code === 'Escape') {
        closeModalWindow();
    };

};



// функция закрытия модалки
function closeModalWindow(e) {
  if (e?.target === modalImg) {
    return;
    }
    
  document.removeEventListener('keydown', closeByEscape);
  modalDiv.setAttribute('class', '');
  modalDivButton.setAttribute('class', 'invisible');
  modalImg.setAttribute('src', '');
}

// gallery.addEventListener('click', event => {
//   const instance = basicLightbox.create(
//     `
// <img width="800" height="600" src="${event.target.dataset['img']}">
// 	`,
//   );
//   instance.show();
// });