const buildHeader = (headerType, headerParams, headerText, urlNeeded) => {
  // if (!headerText) return;
  headerParamsString = ``;
  // if (headerText) {
  headerParamsString += `<div class="mb-2" id="headerText"> ${headerText ? `Header Text: ${headerText}` : ''}</div>`;
  // }
  headerParamsString += `<div id="inputHeaderParams">`;
  if (headerParams) {
    for (let i = 1; i <= headerParams; i++) {
      headerParamsString += `<ul>
            <input placeholder="parameter ${i}"   style="max-width: 30vw" class="form-control" id="headerParam${i}" type="text" />
          </ul>`;
    }
  }

  if (urlNeeded) {
    headerParamsString += `<div class="mb-2" style="max-width: 30vw" id="urlContainer">${headerType} URL <input id="${headerType}Url" class="form-control" placeholder="https://mymedia.url" type="text" /></div>`;
  }
  headerParamsString += `</div>`;

  document.getElementById('templates').insertAdjacentHTML('afterbegin', headerParamsString);
};

const buildOptions = (data) => {
  let options = `<div class="input-group mb-3">
                <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Templates</label>
                </div>
                <select class="custom-select" id="inputGroupSelect01">`;
  options += `<option value=Select>Select template</option>`;
  data.forEach((template) => {
    options += `<option value=${template.name}>${template.name}</option>`;
  });
  options += `</select></div>`;
  document.getElementById('templates').insertAdjacentHTML('beforebegin', options);
};

const buildParamsBody = (text, numberParams, headerText) => {
  let bodyString = `<div class="mb-2" id="bodyText"><label> Body Text : ${text}</label></div>
                <div class="mb-2" id="inputParamdiv">`;
  if (numberParams) {
    for (let i = 1; i <= numberParams; i++) {
      bodyString += `<ul>
               
                <input style="max-width: 30vw" placeholder= "parameter ${i}" class="form-control" id="parameter${i}" type="text" />
                </ul>`;
    }
  }
  bodyString += `<textarea
    style="max-width: 50vw"
    maxlength="4096"
    placeholder= "${headerText || ''}\n${text}"
    class="form-control"
    id="preview"
    name="text"
    readonly
    aria-describedby="textHelp"
    rows="3" ></textarea> </div>`;

  //   bodyString += `  <text rows="3" style="max-width: 60vw" placeholder= "${text}" class="form-control" id="preview" type="text" />  </div>`;
  document.getElementById('templates').insertAdjacentHTML('beforeend', bodyString);
};

const buildTemplateSettings = (name, lang) => {
  const settingsString = `<div class="mb-2" id="settings"><label>Template Name: <span id="templateName">${name}</span></label>
 <label>Template Language: <span id="templateLanguage">${lang}</span></label></div>`;
  document.getElementById('templates').insertAdjacentHTML('afterbegin', settingsString);
};

const clearSettings = () => {
  const settings = document.getElementById('settings');
  if (settings) settings.remove();
};

const setUpEventListeners = (numberParams) => {
  for (let i = 1; i <= numberParams; i++) {
    document.getElementById(`parameter${i}`).addEventListener('keyup', (e) => {
      console.log('changed input');

      let preview = document.getElementById('preview');
      let newString = preview.placeholder.replace(`{{${i}}}`, e.target.value);
      preview.placeholder = newString;
    });
  }
};

const clearBody = () => {
  if (document.getElementById('bodyText')) {
    document.getElementById('bodyText').remove();
  }
  if (document.getElementById('inputParamdiv')) {
    document.getElementById('inputParamdiv').remove();
  }
};

const clearHeader = () => {
  if (document.getElementById('inputHeaderParams')) {
    document.getElementById('inputHeaderParams').remove();
  }

  if (document.getElementById('headerText')) {
    document.getElementById('headerText').remove();
  }
  if (document.getElementById('urlContainer')) {
    document.getElementById('urlContainer').remove();
  }
};

const getNumberParams = (text) => {
  return text.match(/[{{]/gi)?.length / 2 || undefined;
};

const formatTemplate = (template) => {
  let headerParams, urlNeeded, headerText;
  try {
    const header = template.components.find((e) => e.type === 'HEADER');

    const headerNeedsInput =
      header?.format === 'TEXT' || header?.format === 'IMAGE' || header?.format === 'VIDEO' || header?.format === 'DOCUMENT';
    const templText = template.components.find((e) => e.type === 'BODY').text;
    if (headerNeedsInput) {
      if (header.format === 'TEXT') {
        headerText = header.text;
        headerParams = getNumberParams(header.text);
      } else urlNeeded = true;
    }
    return {
      templateText: templText,
      numberParams: getNumberParams(templText),
      headerParams: headerParams,
      urlNeeded: urlNeeded,
      headerType: header?.format,
      headerText: headerText,
    };
  } catch (e) {
    console.log(e);
  }
};
