(() => {
  const entry = (word, meaning, source, description = '') => ({ word, meaning, source, ...(description ? { description } : {}) });
  const ra2 = (rows, source) => rows.map(([word, meaning, description]) => entry(word, meaning, source, description));

  const advancedVerbs = [
    ['солнышко', 'sunshine; a term of affection'], ['сначала', 'at first; first'], ['опоздать', 'to be late'], ['босс', 'boss'], ['продукты', 'groceries; food products'], ['бедняжка', 'poor thing'], ['ужин', 'dinner'], ['свой', 'one’s own'],
    ['Давным давно!', 'Once upon a time; long ago!'], ['ЦУМ', 'TSUM department store'], ['цветы', 'flowers'], ['искать', 'to look for; search'], ['заболел', 'got sick (masculine)'], ['чувствую себя', 'I feel; I feel myself'], ['неплохо', 'not bad'], ['кашлять', 'to cough'], ['иногда', 'sometimes'],
    ['ребята', 'guys; folks'], ['сам — сама', 'self; by oneself (masculine — feminine)'],
    ['(по)целовать', 'to kiss'], ['рисковать', 'to risk'], ['паниковать', 'to panic'], ['парковать', 'to park'], ['стартовать', 'to start'], ['копировать — скопировать', 'to copy; to make a copy'], ['рекомендовать — порекомендовать', 'to recommend'], ['фотографировать — сфотографировать', 'to photograph; take a photo'], ['декларировать — задекларировать', 'to declare'], ['флиртовать — пофлиртовать', 'to flirt'], ['танцевать — потанцевать', 'to dance'], ['тестировать — потестировать', 'to test'], ['анализировать', 'to analyze'], ['игнорировать', 'to ignore'], ['программировать — запрограммировать', 'to program'], ['регистрировать — зарегистрировать', 'to register'], ['интересоваться — поинтересоваться', 'to be interested in; ask about'], ['нокаутировать', 'to knock out'],
    ['обратно', 'back; in the opposite direction'], ['число', 'number'], ['уехать', 'to leave; go away'], ['вернуться', 'to return; come back'], ['вагон', 'train car'], ['купе', 'compartment (on a train)'], ['СВ (эс-вэ)', 'sleeping compartment; deluxe train car'], ['плацкарт', 'open sleeper train car'], ['так далее', 'and so on'], ['сдача', 'change (money returned)'], ['двести', 'two hundred'], ['триста', 'three hundred']
  ];

  const vocabBlaster = [
    ['пилот', 'pilot'], ['экономист', 'economist'], ['солдат', 'soldier', 'Course note: borderline cognate.'], ['спортсмен', 'athlete; sportsperson'], ['медсестра', 'nurse'], ['студент', 'student (male)'], ['студентка', 'student (female)'], ['танцор', 'dancer (male)'], ['танцовщица', 'dancer (female)'], ['певец', 'singer (male)'], ['певица', 'singer (female)'], ['писатель', 'writer'], ['учитель', 'teacher'], ['строитель', 'builder; constructor'], ['повар', 'cook; chef'], ['бухгалтер', 'accountant'],
    ['бабушка', 'grandmother'], ['дедушка', 'grandfather'], ['родственники', 'relatives'], ['внук', 'grandson'], ['внучка', 'granddaughter'], ['отец', 'father'],
    ['фрукт', 'fruit'], ['гамбургер', 'hamburger'], ['хот-дог', 'hot dog'], ['йогурт', 'yogurt'], ['кола', 'cola'], ['лимонад', 'lemonade'], ['говядина', 'beef'], ['рыба', 'fish'], ['мороженое', 'ice cream'], ['клубника', 'strawberry'], ['виноград', 'grapes'], ['овощи', 'vegetables'], ['хлопья', 'cereal; flakes'], ['орехи', 'nuts'], ['конфеты', 'candy'],
    ['Я говорю по-французски.', 'I speak French.'], ['Я говорю по-итальянски.', 'I speak Italian.'], ['Я говорю по-испански.', 'I speak Spanish.'], ['Я говорю по-немецки.', 'I speak German.'],
    ['французский', 'French (masculine)'], ['французское', 'French (neuter)'], ['французская', 'French (feminine)'], ['итальянская', 'Italian (feminine)'], ['итальянское', 'Italian (neuter)'], ['итальянский', 'Italian (masculine)'], ['английский', 'English (masculine)'], ['английское', 'English (neuter)'], ['американский', 'American (masculine)'], ['американские', 'American (plural)'], ['американская', 'American (feminine)'], ['американское', 'American (neuter)'], ['немецкая', 'German (feminine)'], ['немецкий', 'German (masculine)'], ['немецское', 'German (neuter)'], ['испанские', 'Spanish (plural)'], ['испанская', 'Spanish (feminine)'], ['испанский', 'Spanish (masculine)'],
    ['холодильник', 'refrigerator', 'Course example: Мне нужен холодильник.'], ['зеркало', 'mirror', 'Course example: Мне нужно зеркало.'], ['ручка', 'pen', 'Course example: Мне нужна ручка.'], ['галстук', 'tie', 'Course example: Мне нужен галстук.'], ['мыло', 'soap', 'Course example: Мне нужно мыло.'], ['чашка', 'cup', 'Course example: Мне нужна чашка.'],
    ['сигареты', 'cigarettes'], ['бумажник', 'wallet'], ['лекарство', 'medicine'], ['сумка', 'bag; purse'], ['очки', 'glasses'], ['документы', 'documents'],
    ['потерять', 'to lose'], ['пробовать', 'to try; taste'], ['решить', 'to decide'], ['кричать', 'to shout; yell'], ['вспомнить', 'to remember; recall'],
    ['актёр', 'actor'], ['актриса', 'actress'], ['автор', 'author'], ['опера', 'opera'], ['клип', 'music video; clip'], ['спектакль', 'stage play; theatrical show'], ['праздник', 'holiday; celebration'], ['песня', 'song'], ['блюдо', 'dish'], ['напиток', 'drink; beverage'], ['животное', 'animal'], ['передача', 'TV program; broadcast'],
    ['фу!', 'Yuck!', 'Used when something tastes or smells disgusting.'], ['например', 'for example'], ['Вряд ли', 'probably not; unlikely'], ['бедняга!', 'poor thing!'], ['Каждому своё', 'to each their own'], ['Пальчики оближешь', 'finger-licking good', 'Use after delicious food; literally “you’ll lick your fingers.”'], ['Сыт / сыта', 'full; satisfied (masculine / feminine)'],
    ['тело', 'body'], ['волосы', 'hair'], ['кожа', 'skin'], ['глаза', 'eyes'], ['улыбка', 'smile'], ['зубы', 'teeth'],
    ['юбка', 'skirt'], ['платье', 'dress'], ['штаны', 'pants; trousers'], ['пальто', 'coat'], ['шляпа', 'hat'], ['купальник', 'swimsuit'],
    ['матрёшка', 'nesting doll'], ['открытка', 'postcard'], ['самовар', 'samovar'], ['флаг', 'flag'], ['магнит', 'magnet'], ['календарь', 'calendar'],
    ['каша', 'porridge; kasha'], ['яйца', 'eggs'], ['свинина', 'pork'], ['арбуз', 'watermelon'], ['шпинат', 'spinach'], ['перец', 'pepper'],
    ['полотенце', 'towel'], ['фен', 'blow-dryer'], ['принтер', 'printer'], ['кондиционер', 'air conditioner'], ['одеяло', 'blanket'], ['посуда', 'dishes; tableware'],
    ['выглядишь', 'you look; you appear'], ['Покажите', 'show me (formal or plural)'], ['возьму', 'I’ll take'], ['Мне повезло!', 'I got lucky!'], ['Какая разница?', 'What difference does it make?'], ['вот так', 'like this; that’s how'], ['Дурак!', 'Idiot!; fool!'], ['Ладно', 'okay; all right']
  ];

  window.RA_SUPPLEMENTAL_VOCABULARY = [
    ...ra2(advancedVerbs, 'Russian Accelerator 2 · Advanced Verbs & Idioms'),
    ...ra2(vocabBlaster, 'Russian Accelerator 2 · Vocab Blaster')
  ];
})();
