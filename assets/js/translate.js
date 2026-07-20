// Google Translate Widget — Grand African Projects
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'fr',
      includedLanguages: 'en,fr,sw,ar,pt,es,zh-CN,rw,ln,kg',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
      gaTrack: false
    },
    'google_translate_element'
  );
}
