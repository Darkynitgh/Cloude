

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
                    $("#modal_success").modal('show')
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divMensajeSuccess').style.display = 'none'
                    document.getElementById('divTitleSuccess').style.display = 'block'
                    document.getElementById('pTitleSuccess').innerHTML = title

                }
            }
            $("#modal_success").modal('show')
        } catch (e) {
            console.error(e)
        }
    },
    error: function (title, subtitle, lista) {
        try {
            if ((title != undefined && title != null) && (subtitle != undefined && subtitle != null)) {
                document.getElementById('divTitleError').style.display = 'block'
                document.getElementById('pTitleError').innerHTML = title
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
                    document.getElementById('divMensajeError').style.display = 'block'
                    document.getElementById('subPError').innerHTML = subtitle
                }
                $("#modal_error").modal('show')
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
                    $("#modal_error").modal('show')
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divTitleError').style.display = 'block'
                    document.getElementById('divMensajeError').style.display = 'none'
                    document.getElementById('pTitleError').innerHTML = title
                    $("#modal_error").modal('show')
                }
            }
        } catch (e) {
            console.error(e)
        }
    },
    confirm: async (title) => {
        return new Promise((complete, failed) => {
            document.getElementById('pConfirmacion').innerHTML = title
            $("#modal_confirm").modal('show')

            $('#btnAceptarAlert').on('click', function () {
                $("#modal_confirm").modal('hide')
                complete(true)
            })

            $('#btnCancelarAlert').on('click', function () {
                $("#modal_confirm").modal('hide')
                complete(false)
            })

            $('#modal_confirm').on('hidden.bs.modal', function (e) {
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
                $("#modal_info").modal('show')
            } else {
                if ((title == undefined || title == null) && subtitle != undefined) {
                    document.getElementById('divTitleInfo').style.display = 'none'
                    document.getElementById('divMensajeInfo').style.display = 'block'
                    document.getElementById('subPInfo').innerHTML = subtitle
                    $("#modal_info").modal('show')
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divMensajeInfo').style.display = 'none'
                    document.getElementById('divTitleInfo').style.display = 'block'
                    document.getElementById('pTitleInfo').innerHTML = title
                    $("#modal_info").modal('show')
                }
            }
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
                $("#modal_warning").modal('show')
            } else {
                if ((title == undefined || title == null) && subtitle != undefined) {
                    document.getElementById('divTitleWarning').style.display = 'none'
                    document.getElementById('divMensajeWarning').style.display = 'block'
                    document.getElementById('subPWarning').innerHTML = subtitle
                    $("#modal_warning").modal('show')
                } else if ((subtitle == undefined || subtitle == null) && title != undefined) {
                    document.getElementById('divMensajeWarning').style.display = 'none'
                    document.getElementById('divTitleWarning').style.display = 'block'
                    document.getElementById('pTitleWarning').innerHTML = title
                    $("#modal_warning").modal('show')
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
}


