'use strict'
/**
 * crypter.js
 * Contains scripts for crypter.html
 ******************************/
const dialog = remote.dialog
const paths = remote.getGlobal('paths')
const { basename } = require('path')
let errLabel, fileInput, fileInputD, cryptedContainer, fileInputText, ifileInputText, crypted_template

$(window)
  .on('load', function () {
    // Get DOM elements
    errLabel = $('#errLabel')
    fileInput = $('#fileInput')
    fileInputD = document.getElementById('fileInput')
    cryptedContainer = $('#crypted-container')
    fileInputText = fileInput.find('#fileInputText')
    ifileInputText = fileInputText.text()
    // compile the crypted template
    crypted_template = Handlebars.compile($('#crypted-template')
      .html())
    // attach  event
    fileInputD.ondragover = function () {
      return false
    }
    fileInputD.ondragleave = fileInputD.ondragend = function () {
      return false
    }

    enableFileInput()
  })

/* Event listeners */
ipcRenderer.on('cryptedFile', function (event, file) {
  console.log(`IPCRENDER cryptedFile emitted`)
  let fileHTML = crypted_template(file)
  cryptedContainer.html(fileHTML)
  enableUI()
  navigate('crypted')
})

ipcRenderer.on('decryptedFile', function (event, file) {
  console.log(`IPCRENDER decryptedFile emitted`)
  let fileHTML = crypted_template(file)
  cryptedContainer.html(fileHTML)
  enableUI()
  navigate('crypted')
})

ipcRenderer.on('cryptErr', function (event, err) {
  console.log(`IPCRENDER cryptErr emitted`)
  errLabel.text(`ERROR: ${err}`)
    .show()
  enableUI()
})

ipcRenderer.on('encryptingFile', function (event, file) {
  console.log(`IPCRENDER encryptingFile emitted`)
  fileInputText.text(`Encrypting ${basename(file)}...`)
  disableUI()
})

ipcRenderer.on('decryptingFile', function (event, file) {
  console.log(`IPCRENDER decryptingFile emitted`)
  fileInputText.text(`Decrypting ${basename(file)}...`)
  disableUI()
})


/* Helper functions */
function disableFileInput() {
  fileInput.off('click', handler)
  fileInput.ondrop = function () {
    return false
  }
}

function enableFileInput() {
  fileInput.on('click', handler)
  fileInputD.ondrop = function (e) {
    e.preventDefault()
    console.info(`ONDROP fired!`)
    if (e.dataTransfer.files[0].path) {
      console.info(`Got file: ${e.dataTransfer.files[0].path}`)
      ipcRenderer.send('cryptFile', e.dataTransfer.files[0].path)
    }
    return false
  }
}

function enableUI() {
  fileInputText.text(ifileInputText)
  enableFileInput()
}

function disableUI() {
  disableFileInput()
  errLabel.hide()
}

function handler() {
  // Prevent multiple input dialog
  fileInput.off('click', handler)
  // Create file input dialog
  dialog.showOpenDialog({
    title: 'Choose a file to Encrypt',
    defaultPath: paths.documents, // open dialog at home directory
    properties: ['openFile', 'openDirectory']
  }, function (filePath) {
    // callback for selected file returns undefined if file not selected by user
    if (filePath && filePath.length === 1) {
      ipcRenderer.send('cryptFile', filePath[0])
    } else {
      fileInput.on('click', handler)
    }
  })
  return false
}