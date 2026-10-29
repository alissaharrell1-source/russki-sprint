(function () {
  const $ = (selector) => document.querySelector(selector);
  const api = {};
  async function invoke(functionName, body) {
    if (!supabaseClient) throw new Error('Cloud services are not available in this browser.');
    const { data, error } = await supabaseClient.functions.invoke(functionName, { body });
    if (error) throw error;
    if (data && data.error) throw new Error(data.error);
    return data;
  }
  api.generateParagraphs = (target) => invoke('generate-paragraphs', { target_word_or_phrase: target });
  api.evaluateWord = (body) => invoke('evaluate-word', body);
  window.russianSprintApi = api;
  async function ensureLibraryLoaded() {
    if (window.TARGETED_READING_LIBRARY) return;
    if (window.__targetedLibraryPromise) return window.__targetedLibraryPromise;
    window.__targetedLibraryPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = './targeted-reading-library.js';
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
    return window.__targetedLibraryPromise;
  }
  function key(value) {
    return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"!?.,:;()]/g, '').replace(/\s+/g, ' ').trim();
  }
  function libraryPassages(phrase) {
    const source = window.TARGETED_READING_LIBRARY || {};
    const target = key(phrase);
    const exact = source[target] || source[phrase] || Object.entries(source).find(([candidate]) => key(candidate) === target)?.[1];
    if (!Array.isArray(exact)) return [];
    return exact.map((ru, index) => ({ ru: String(ru), en: '', note: '', index, source: 'library' }));
  }
  function mapParagraphs(data) {
    return (data.paragraphs || []).map((item, index) => ({ ru: String(item.russian_text || '').replace(/\*\*/g, ''), en: '', note: String(item.grammar_note || ''), index, source: 'ai' }));
  }
  function hideEnglish() {
    const node = $('#targetedReadingEnglish');
    if (node) { node.textContent = ''; node.hidden = true; }
  }
  async function generateTargetedParagraphs() {
    const input = $('#targetedReadingInput');
    if (!input) return;
    const phrase = input.value.replace(/\s+/g, ' ').trim();
    if (!phrase) { targetedReadingPhrase = ''; targetedReadingItems = []; renderTargetedReading(); return; }
    targetedReadingPhrase = phrase;
    targetedReadingIndex = 0;
    targetedReadingItems = [];
    $('#targetedReadingHint').textContent = 'Checking the saved Russian passage library for ' + phrase + '…';
    renderTargetedReading();
    await ensureLibraryLoaded();
    const saved = libraryPassages(phrase);
    if (saved.length) {
      targetedReadingItems = saved;
      renderTargetedReading();
      hideEnglish();
      $('#targetedReadingHint').textContent = 'Saved Russian contexts loaded for ' + phrase + '.';
      return;
    }
    $('#targetedReadingHint').textContent = 'No saved contexts yet for ' + phrase + '. Trying the AI generator…';
    try {
      const data = await api.generateParagraphs(phrase);
      if (!Array.isArray(data?.paragraphs) || data.paragraphs.length !== 10) throw new Error('The generator returned an incomplete set.');
      targetedReadingItems = mapParagraphs(data);
      renderTargetedReading();
      hideEnglish();
      toast('10 Russian passages generated for ' + phrase + '.');
    } catch (error) {
      try {
        targetedReadingItems = await requestTargetedReadingPassages(phrase);
        renderTargetedReading();
        hideEnglish();
        $('#targetedReadingHint').textContent = 'AI generation was unavailable, so the app loaded saved Russian contexts for ' + phrase + '.';
      } catch (fallbackError) {
        targetedReadingItems = [];
        renderTargetedReading();
        $('#targetedReadingHint').textContent = 'No saved passages found for ' + phrase + '. Add it to the library or try again later.';
      }
    }
  }
  function applyRemoteSchedule(item, result) {
    const schedule = result?.srs || {};
    item.cardId = result.card_id || item.cardId;
    item.exposures = (item.exposures || 0) + 1;
    item.lastMode = 'production'; item.lastReviewAt = Date.now(); item.lastExposureAt = Date.now();
    item.reviewsCount = schedule.reviews_count || item.reviewsCount || 0; item.reps = item.reviewsCount;
    item.stability = Number(schedule.interval_days) || item.stability || 1; item.easeFactor = Number(schedule.ease_factor) || item.easeFactor || 2.5;
    item.dueAt = Date.parse(schedule.due_date) || item.dueAt;
    if (result.anki_srs_rating === 'AGAIN') { item.status = 'new'; item.lapses = (item.lapses || 0) + 1; }
    else if (result.status === 'CORRECT' && result.anki_srs_rating === 'EASY') { item.status = 'known'; item.successes = (item.successes || 0) + 1; }
    else { item.status = 'somewhat'; item.successes = (item.successes || 0) + (result.status === 'CORRECT' ? 1 : 0); }
  }
  const localCheckWordPractice = window.checkWordPractice;
  async function checkWordPracticeWithLLM() {
    const item = currentPracticeItem();
    if (!item || wordPracticeLocked) return;
    const typed = normalizePracticeText($('#practiceRussian').value);
    if (!typed) { $('#practiceFeedback').textContent = 'Type the Russian word or phrase first, or reveal the answer.'; $('#practiceRussian').focus(); return; }
    if (!supabaseClient) return localCheckWordPractice();
    const sessionResult = await supabaseClient.auth.getSession();
    if (!sessionResult?.data?.session) return localCheckWordPractice();
    item.cardId = item.cardId || crypto.randomUUID();
    $('#checkWordPractice').disabled = true; $('#practiceFeedback').textContent = 'Evaluating your Russian answer…';
    try {
      const result = await api.evaluateWord({ card_id: item.cardId, english_definition: item.meaning, expected_russian: item.word, user_russian_input: typed });
      applyRemoteSchedule(item, result); save(); wordPracticeLocked = true; wordPracticeAnsweredCorrect = result.status === 'CORRECT'; wordPracticeRevealed = true;
      $('#practiceAnswer').textContent = 'Russian: ' + (result.correct_russian || item.word); $('#practiceAnswer').hidden = false;
      const interval = result.srs?.due_date ? formatDue({ dueAt: Date.parse(result.srs.due_date) }) : 'the next scheduled interval';
      $('#practiceFeedback').textContent = result.feedback_message + ' ' + (result.grammar_tip || '') + ' Scheduled ' + result.anki_srs_rating + ' · ' + interval + '.';
      document.querySelectorAll('[data-anki-rate]').forEach((button) => { button.disabled = true; }); renderVocabulary(); updateStats();
    } catch (error) { $('#checkWordPractice').disabled = false; $('#practiceFeedback').textContent = 'AI evaluation is unavailable, so local recall checking is being used.'; localCheckWordPractice(); }
  }
  const targetButton = $('#generateTargetedReading');
  if (targetButton) targetButton.onclick = generateTargetedParagraphs;
  const practiceButton = $('#checkWordPractice');
  if (practiceButton) practiceButton.onclick = checkWordPracticeWithLLM;
}());
