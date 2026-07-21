// Google Translate Widget — Grand African Projects
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,fr,sw,ar,pt,es,zh-CN,rw,ln,kg',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
      gaTrack: false
    },
    'google_translate_element'
  );
}
