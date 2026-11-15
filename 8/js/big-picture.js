import { isEscapeKey } from './util.js';

const COMMENTS_PORTION = 5;

const bigPicture = document.querySelector('.big-picture');
const bigPictureImg = bigPicture.querySelector('.big-picture__img img');
const likesCount = bigPicture.querySelector('.likes-count');
const commentsCount = bigPicture.querySelector('.comments-count');
const socialCaption = bigPicture.querySelector('.social__caption');
const socialComments = bigPicture.querySelector('.social__comments');
const commentCount = bigPicture.querySelector('.social__comment-count');
const commentsLoader = bigPicture.querySelector('.comments-loader');
const bigPictureCloseButton = bigPicture.querySelector('.big-picture__cancel');

let currentComments = [];
let shownCommentsCount = 0;

const createComment = (comment) => {
  const commentItem = document.createElement('li');
  commentItem.classList.add('social__comment');

  const avatar = document.createElement('img');
  avatar.classList.add('social__picture');
  avatar.src = comment.avatar;
  avatar.alt = comment.name;
  avatar.width = 35;
  avatar.height = 35;

  const commentText = document.createElement('p');
  commentText.classList.add('social__text');
  commentText.textContent = comment.message;

  commentItem.append(avatar, commentText);

  return commentItem;
};

const renderCommentsPortion = () => {
  const fragment = document.createDocumentFragment();
  const nextComments = currentComments.slice(shownCommentsCount, shownCommentsCount + COMMENTS_PORTION);

  nextComments.forEach((comment) => {
    fragment.append(createComment(comment));
  });

  socialComments.append(fragment);

  shownCommentsCount = Math.min(shownCommentsCount + COMMENTS_PORTION, currentComments.length);
  commentCount.textContent = shownCommentsCount;

  if (shownCommentsCount >= currentComments.length) {
    commentsLoader.classList.add('hidden');
  }
};

const openBigPicture = (photo) => {
  currentComments = photo.comments;
  shownCommentsCount = 0;

  bigPictureImg.src = photo.url;
  bigPictureImg.alt = photo.description;
  likesCount.textContent = photo.likes;
  commentsCount.textContent = photo.comments.length;
  socialCaption.textContent = photo.description;

  socialComments.replaceChildren();
  commentsLoader.classList.remove('hidden');
  commentCount.classList.remove('hidden');
  renderCommentsPortion();

  bigPicture.classList.remove('hidden');
  document.body.classList.add('modal-open');
};

const closeBigPicture = () => {
  bigPicture.classList.add('hidden');
  document.body.classList.remove('modal-open');
};

const onCloseButtonClick = () => {
  closeBigPicture();
};

const onDocumentKeyDown = (evt) => {
  if (isEscapeKey(evt) && !bigPicture.classList.contains('hidden')) {
    evt.preventDefault();
    closeBigPicture();
  }
};

const onCommentsLoaderClick = () => {
  renderCommentsPortion();
};

bigPictureCloseButton.addEventListener('click', onCloseButtonClick);
document.addEventListener('keydown', onDocumentKeyDown);
commentsLoader.addEventListener('click', onCommentsLoaderClick);

export { openBigPicture };


