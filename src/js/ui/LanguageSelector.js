const $ = require('jquery')
import LangUtils from '../utils/LangUtils'

export default class LanguageSelector {
  constructor(languageCodes) {
    let text = '\u{1F310} ' // globe symbol for internationalization
    this.$div = $('<div>').text(text).addClass('languageSelector')

    this.$select = $('<select>')
    for (let languageCode of languageCodes) {
      let languageName = LangUtils.getLanguageName(languageCode)
      // Append select options
      this.$select.append($('<option>').val(languageCode).text(languageName))
    }
    this.$select.val(LangUtils.getInitialLanguageCode())

    this.$div.append(this.$select)

    if (localStorage) {
      this.$select.change(() => {
        localStorage.setItem('@@traitOntologyWidget/language', this.getSelected())
      })
    }
  }

  getElement() {
    return this.$div
  }

  getSelected() {
    return this.$select.val()
  }

  addSelectHandler(handler) {
    this.$select.change(() => {
      setTimeout(
        () => handler(this.getSelected()),
        100
      )
    })
  }
}
