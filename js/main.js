const PHOTOS_COUNT = 25;
const MIN_LIKES_COUNT = 15;
const MAX_LIKES_COUNT = 200;
const MIN_COMMENTS = 0;
const MAX_COMMENTS = 30;
const MIN_AVATAR_ID = 1;
const MAX_AVATAR_ID = 6;
const MAX_MESSAGE_SENTENCES = 2;

const PHOTO_DESCRIPTIONS = [
  'Прекрасный закат на берегу моря',
  'Городские огни ночью - красота',
  'Свежий кофе и хорошая книга',
  'Полевые цветы на лугу',
  'Чашечка чая в уютной кофейне',
  'Осенняя атмосфера парка',
  'Ночное звёздное небо',
  'Уличные музыканты',
  'Океанские волны в лучах рассвета',
  'Старинный замок',
  'Велопрогулка по парку',
  'Заснеженные горные вершины',
  'Снежный барс в снегу',
  'Праздничный салют',
  'Аквариум с рыбками',
  'Круизный лайнер в порту',
  'Пряничный домик',
  'Летняя вечеринка на пляже',
  'Милаш-котенок',
  'Цветущая сакура',
  'Букет полевых цветов',
  'Тропический остров',
  'Новогодняя ёлка',
  'Зимний Байкал',
  'Ужин при свечах'
];

const COMMENT_MESSAGES = [
  'Всё отлично!',
  'В целом всё неплохо. Но не всё.',
  'Когда вы делаете фотографию, хорошо бы убирать палец из кадра. В конце концов это просто непрофессионально.',
  'Моя бабушка случайно чихнула с фотоаппаратом в руках и у неё получилась фотография лучше.',
  'Я поскользнулся на банановой кожуре и уронил фотоаппарат на кота и у меня получилась фотография лучше.',
  'Лица у людей на фотке перекошены, как будто их избивают. Как можно было поймать такой неудачный момент?!'
];

const COMMENT_AUTHOR_NAMES = [
  'Артём',
  'Дмитрий',
  'Анастасия',
  'Александр',
  'Пётр',
  'Николай',
  'Владислав',
  'Илона',
  'Аделия',
  'Григорий',
  'Анна'
];

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

createPhotos();
