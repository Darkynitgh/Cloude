let url = "";

if (document.location.port == "") {
    url = document.location.protocol + "//" + document.location.hostname + "/redosel/";
} else {
    url = document.location.protocol + "//" + document.location.hostname + ":" + document.location.port + "/";
}



Vue.createApp({
    data() {
        return {
            value: {
                usuario: '',
                password: '',
                usuarioRecupera: ''
            }
        }
    },
    methods: {
        acceder() {
            var ds = new FormData();

            let msj = '';
            if (this.value.usuario.trim() === '') {
                msj += '<li>Ingrese el usuario</li>';
            }
            if (this.value.password.trim() === '') {
                msj += '<li>Ingrese la contraseña</li>';
            }


            if (msj === '') {
                $('.cargando-c').show();
                ds.append('usuario', this.value.usuario);
                ds.append('password', this.value.password);

                axios.post(url + 'Administracion/ValidaAcceso', ds).then(res => {
                    $('.cargando-c').hide();

                    sessionStorage.setItem('tokRedOsel', res.data.token);
                    //sessionStorage.setItem('rshRedOsek', res.data.refreshToken);

                    $('.cargando-c').show();
                    document.location.assign(url + 'Administracion/Inicio');
                }).catch(err => {
                    validError(err);
                })
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }          
        },
        abreModalRestablecer() {
            $('#modal_restablecer').modal('show');
        },
        enviaSolicitud() {
            if (this.value.usuarioRecupera.trim() !== '') {
                $('.cargando-c').show();
                axios.post(url + 'Administracion/RestablecerContrasena', {
                    usuario: this.value.usuarioRecupera.trim()
                }).then(res => {
                    alerts.success('La solicitud ha sido recibida', 'Se le envió un correo electrónico para continuar el proceso');
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            } else {
                alerts.error('Ingrese el usuario');
            }           
        }
    },
    mounted() {
        sessionStorage.removeItem('tokRedOsel');
        sessionStorage.removeItem('rshRedOsek');
    }
}).mount('#appLogin');



const validError = (error) => {
    $('.cargando-c').hide();
    if (error.isAxiosError) {
        let mensaje = error.request.responseText !== '' && error.request.responseText !== undefined && error.request.responseText !== null ? error.request.responseText : error.message
        console.error(mensaje)
        alerts.error('Error', mensaje, 1)
    } else {
        console.error(error)
        alerts.error('Error', error, 1)
    }
}
