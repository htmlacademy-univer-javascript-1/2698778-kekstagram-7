import {
  PHOTOS_COUNT,
  MIN_LIKES_COUNT,
  MAX_LIKES_COUNT,
  MIN_COMMENTS,
  MAX_COMMENTS,
  MIN_AVATAR_ID,
  MAX_AVATAR_ID,
  MAX_MESSAGE_SENTENCES,
  PHOTO_DESCRIPTIONS,
  COMMENT_MESSAGES,
  COMMENT_AUTHOR_NAMES
} from './data.js';

const getRandomInteger = (a, b) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  const result = Math.random() * (upper - lower + 1) + lower;

  return Math.floor(result);
};

const getRandomElement = (elements) => elements[getRandomInteger(0, elements.length - 1)];

const getRandomMessage = () => {
  const sentencesCount = getRandomInteger(1, MAX_MESSAGE_SENTENCES);
  const usedSentences = new Set();
  const sentences = [];

  while (sentences.length < sentencesCount) {
    const sentence = getRandomElement(COMMENT_MESSAGES);

    if (!usedSentences.has(sentence)) {
      usedSentences.add(sentence);
      sentences.push(sentence);
    }
  }

  return sentences.join(' ');
};

const createIdGenerator = () => {
  let currentId = 0;

  return () => {
    currentId += 1;
    return currentId;
  };
};

const getCommentId = createIdGenerator();

const createComment = () => ({
  id: getCommentId(),
  avatar: `img/avatar-${getRandomInteger(MIN_AVATAR_ID, MAX_AVATAR_ID)}.svg`,
  message: getRandomMessage(),
  name: getRandomElement(COMMENT_AUTHOR_NAMES)
});

const createComments = (count) => Array.from({ length: count }, createComment);

const createPhoto = (index) => ({
  id: index,
  url: `photos/${index}.jpg`,
  description: getRandomElement(PHOTO_DESCRIPTIONS),
  likes: getRandomInteger(MIN_LIKES_COUNT, MAX_LIKES_COUNT),
  comments: createComments(getRandomInteger(MIN_COMMENTS, MAX_COMMENTS))
});

const createPhotos = () =>
  Array.from({ length: PHOTOS_COUNT }, (_, index) => createPhoto(index + 1));

export { createPhotos };
