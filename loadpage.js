function loadPartialHTML_(partial) {
  const htmlServ = HtmlService.createTemplateFromFile(partial);
  return htmlServ.evaluate().getContent();
}

function loadInputView() {
  return loadPartialHTML_('input');
}

function loadChooseView() {
  return loadPartialHTML_('input_hide');
}

function loadModify() {
  return loadPartialHTML_('modify');
}

function loadAfterModify() {
  return loadPartialHTML_('modify_hide');
}

function loadBomResearch() {
  return loadPartialHTML_('bomresearch');
}

function loadSurmodi() {
  return loadPartialHTML_('surmodi');
}

function loadSurmodiHide() {
  return loadPartialHTML_('surmodi_hide');
}