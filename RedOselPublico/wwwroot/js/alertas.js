const success = document.getElementById('modal_success')
success.addEventListener('hidden.bs.modal', function (event) {
    // do something...
    getActiveBackDropModals()
})
success.addEventListener('shown.bs.modal', function (event) {
    // do something...
    document.getElementById('okSuccess').focus();
})


const error = document.getElementById('modal_error')
error.addEventListener('hidden.bs.modal', function (event) {
    // do something...    
    getActiveBackDropModals()
})
error.addEventListener('shown.bs.modal', function (event) {
    // do something...    
    document.getElementById('okError').focus();
})


const confirm = document.getElementById('modal_confirm')
confirm.addEventListener('hidden.bs.modal', function (event) {
    // do something...
    getActiveBackDropModals()
})
confirm.addEventListener('shown.bs.modal', function (event) {
    // do something...
    document.getElementById('btnCancelarAlert').focus();
})


const info = document.getElementById('modal_info')
info.addEventListener('hidden.bs.modal', function (event) {
    // do something...
    getActiveBackDropModals()
})
info.addEventListener('shown.bs.modal', function (event) {
    // do something...
    document.getElementById('okInfo').focus();
})


const warning = document.getElementById('modal_warning')
warning.addEventListener('hidden.bs.modal', function (event) {
    // do something...
    getActiveBackDropModals()
})
warning.addEventListener('shown.bs.modal', function (event) {
    // do something...
    document.getElementById('okWarning').focus();
})



const modalSuccess = new bootstrap.Modal(document.getElementById('modal_success'), {
    keyboard: false
})

const modalError = new bootstrap.Modal(document.getElementById('modal_error'), {
    keyboard: false
})

const modalConfirm = new bootstrap.Modal(document.getElementById('modal_confirm'), {
    keyboard: false
})

const modalInfo = new bootstrap.Modal(document.getElementById('modal_info'), {
    keyboard: false
})

const modalWarning = new bootstrap.Modal(document.getElementById('modal_warning'), {
    keyboard: false
})

const alerts = {
    success: function (title, subtitle) {
        try {
            if ((title != undefined && title != null) && (subtitle != undefined && subtitle != null)) {
                document.getElementById('divTitleSuccess').style.display = 'block'
                document.getElementById('divMensajeSuccess').style.display = 'block'
                document.getElementById('pTitleSuccess').innerHTML = title
                document.getElementById('subPSuccess').innerHTML = subtitle
            } else {
                if ((title == undefined || title == null) && subtitle != undefined) {
                    document.getElementById('divTitleSuccess').style.display = 'none'
                    document.getElementById('divMensajeSuccess').style.display = 'block'
                    document.getElementById('subPSuccess').innerHTML = subtitle
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divMensajeSuccess').style.display = 'none'
                    document.getElementById('divTitleSuccess').style.display = 'block'
                    document.getElementById('pTitleSuccess').innerHTML = title

                }
            }
            modalSuccess.show()
        } catch (e) {
            console.error(e)
        }
    },
    error: function (title, subtitle, lista) {
        try {
            if ((title != undefined && title != null) && (subtitle != undefined && subtitle != null)) {
                document.getElementById('divTitleError').style.display = 'block'
                document.getElementById('pTitleError').innerHTML = title
                if (lista == 1) {
                    let array = subtitle.split("\n")
                    let text = ''
                    for (var i = 0; i < array.length; i++) {
                        text += array[i] + '</br>'
                    }
                    document.getElementById('divMensajeError').style.display = 'block'
                    document.getElementById('subPError').innerHTML = text
                    document.getElementById('subPError').style.paddingLeft = '20px'
                    document.getElementById('subPError').style.textAlign = 'justify'
                } else {
                    document.getElementById('divMensajeError').style.display = 'block'
                    document.getElementById('subPError').innerHTML = subtitle
                }
            } else {
                if ((title == undefined || title == null) && subtitle != undefined) {
                    document.getElementById('divTitleError').style.display = 'none'
                    if ((subtitle.match(/\n/g) || []).length != 0 && lista == 1) {
                        let array = subtitle.split("\n")
                        let text = ''
                        for (var i = 0; i < array.length; i++) {
                            text += array[i] + '</br>'
                        }
                        document.getElementById('divMensajeError').style.display = 'block'
                        document.getElementById('subPError').innerHTML = text
                        document.getElementById('subPError').style.paddingLeft = '20px'
                        document.getElementById('subPError').style.textAlign = 'justify'
                    } else {
                        document.getElementById('subPError').innerHTML = subtitle
                    }
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divTitleError').style.display = 'block'
                    document.getElementById('divMensajeError').style.display = 'none'
                    document.getElementById('pTitleError').innerHTML = title
                }
            }
            modalError.show()
        } catch (e) {
            console.error(e)
        }
    },
    confirm: async (title) => {
        return new Promise((complete, failed) => {
            let objModalConfirm = document.getElementById('modal_confirm')
            objModalConfirm.addEventListener('hidden.bs.modal', function (event) {
                complete(false)
            })

            document.getElementById('pConfirmacion').innerHTML = title
            modalConfirm.show()

            let btnCancelar = document.getElementById('btnCancelarAlert')
            let btnAceptar = document.getElementById('btnAceptarAlert')

            btnAceptar.addEventListener('click', () => {
                modalConfirm.hide()
                complete(true)
            })

            btnCancelar.addEventListener('click', () => {
                modalConfirm.hide()
                complete(false)
            })


        });
    },
    info: function (title, subtitle) {
        try {
            if ((title != undefined && title != null) && (subtitle != undefined && subtitle != null)) {
                document.getElementById('divTitleInfo').style.display = 'block'
                document.getElementById('divMensajeInfo').style.display = 'block'
                document.getElementById('pTitleInfo').innerHTML = title
                document.getElementById('subPInfo').innerHTML = subtitle
            } else {
                if ((title == undefined || title == null) && subtitle != undefined) {
                    document.getElementById('divTitleInfo').style.display = 'none'
                    document.getElementById('divMensajeInfo').style.display = 'block'
                    document.getElementById('subPInfo').innerHTML = subtitle
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divMensajeInfo').style.display = 'none'
                    document.getElementById('divTitleInfo').style.display = 'block'
                    document.getElementById('pTitleInfo').innerHTML = title
                }
            }
            modalInfo.show()
        } catch (e) {
            console.error(e)
        }
    },
    warning: function (title, subtitle) {
        try {
            if ((title != undefined && title != null) && (subtitle != undefined && subtitle != null)) {
                document.getElementById('divTitleWarning').style.display = 'block'
                document.getElementById('divMensajeWarning').style.display = 'block'
                document.getElementById('pTitleWarning').innerHTML = title
                document.getElementById('subPWarning').innerHTML = subtitle
            } else {
                if ((title == undefined || title == null) && subtitle != undefined) {
                    document.getElementById('divTitleWarning').style.display = 'none'
                    document.getElementById('divMensajeWarning').style.display = 'block'
                    document.getElementById('subPWarning').innerHTML = subtitle
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divMensajeWarning').style.display = 'none'
                    document.getElementById('divTitleWarning').style.display = 'block'
                    document.getElementById('pTitleWarning').innerHTML = title
                }
            }

            modalWarning.show()
        } catch (e) {
            console.error(e)
        }
    }
}

const zIndexModal = 1050
const modalGeneral = [].slice.call(document.querySelectorAll('.modal'))
let listaModalFade;

modalGeneral.map((item) => {
    try {
        item.addEventListener('shown.bs.modal', (e) => {
            //item.classList.remove('focus-input')
            var visibleModalsCount = document.querySelectorAll('.modal.fade.show').length

            if (visibleModalsCount > 1) {
                var zIndex = zIndexModal + (100 * visibleModalsCount)
                item.style.zIndex = zIndex
            }

            listaModalFade = [].slice.call(document.querySelectorAll('.modal-backdrop'))
            listaModalFade.map((item, index) => {
                if (visibleModalsCount !== 1) {

                    if ((listaModalFade.length - 1) === index) {
                        item.style.zIndex = zIndex - 10
                        item.classList.add('modal-stack')
                    }
                }
            })


        })

    } catch (e) {
        console.error('ERROR ALERT EVENT\n', e)
    }

})



function getActiveBackDropModals() {
    var listaModalBackDrop = [].slice.call(document.querySelectorAll('.modal-backdrop'))
    var lengthBackDrop = listaModalBackDrop.length

    listaModalBackDrop.map((item, index) => {
        if (listaModalBackDrop.length === 1) {
            var visibleModalsCount = document.querySelectorAll('.modal.fade.show').length

            if (visibleModalsCount === 0) {
                item.remove()
            } else {
                item.style.zIndex = 1050
            }
        } else {
            var visibleModalsCount = document.querySelectorAll('.modal.fade.show').length
            if (visibleModalsCount === 0) {
                item.remove()
            } else {
                if (lengthBackDrop > 1 && visibleModalsCount === 0) {
                    item.remove()
                    lengthBackDrop--
                } else {
                    if (visibleModalsCount == 1) {
                        item.style.zIndex = 1050
                    }
                }
            }
        }
    })
}


