import { isEscapeKey } from './util.js';

const MAX_HASHTAGS = 5;
const MAX_HASHTAG_LENGTH = 20;
const MAX_COMMENT_LENGTH = 140;

const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = uploadForm.querySelector('.img-upload__input');
const uploadOverlay = uploadForm.querySelector('.img-upload__overlay');
const uploadCancel = uploadForm.querySelector('.img-upload__cancel');
const hashtagField = uploadForm.querySelector('.text__hashtags');
const commentField = uploadForm.querySelector('.text__description');

const pristine = new Pristine(uploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'img-upload__item--invalid',
  successClass: 'img-upload__item--valid',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'div',
  errorTextClass: 'img-upload__error',
});

const getHashtags = (value) => value.trim().split(/\s+/).filter(Boolean);

const validateHashtagsCount = (value) => getHashtags(value).length <= MAX_HASHTAGS;

const validateHashtagsFormat = (value) => getHashtags(value).every((hashtag) =>
  new RegExp(`^#[a-zа-яё0-9]{1,${MAX_HASHTAG_LENGTH - 1}}$`, 'i').test(hashtag)
);

const validateHashtagsUnique = (value) => {
  const hashtags = getHashtags(value).map((hashtag) => hashtag.toLowerCase());

  return hashtags.length === new Set(hashtags).size;
};

pristine.addValidator(
  hashtagField,
  validateHashtagsCount,
  'Можно указывать не больше 5 хэштегов'
);

pristine.addValidator(
  hashtagField,
  validateHashtagsFormat,
  'Хэштег должен начинаться с # и содержать только буквы и цифры. Максимальная длина хэштега 20 символов'
);

pristine.addValidator(
  hashtagField,
  validateHashtagsUnique,
  'Хэштеги должны быть уникальными'
);

pristine.addValidator(
  commentField,
  (value) => value.length <= MAX_COMMENT_LENGTH,
  'Максимальная длина комментария 140 символов'
);

const closeUploadForm = () => {
  uploadOverlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  uploadForm.reset();
  uploadInput.value = '';
  pristine.reset();
};

const onUploadInputChange = () => {
  uploadOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
};

const onUploadCancelClick = () => {
  closeUploadForm();
};

const onDocumentKeydown = (evt) => {
  if (!isEscapeKey(evt)) {
    return;
  }

  if (
    !uploadOverlay.classList.contains('hidden') &&
    document.activeElement !== hashtagField &&
    document.activeElement !== commentField
  ) {
    closeUploadForm();
  }
};

const onUploadFormSubmit = (evt) => {
  if (!pristine.validate()) {
    evt.preventDefault();
  }
};

uploadInput.addEventListener('change', onUploadInputChange);
uploadCancel.addEventListener('click', onUploadCancelClick);
document.addEventListener('keydown', onDocumentKeydown);
uploadForm.addEventListener('submit', onUploadFormSubmit);
