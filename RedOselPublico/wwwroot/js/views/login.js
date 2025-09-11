


let url = "", modalRecuperacion;


if (document.location.port == "") {
    url = document.location.protocol + "//" + document.location.hostname + "/redoselpublico/";
} else {
    url = document.location.protocol + "//" + document.location.hostname + ":" + document.location.port + "/";
}



Vue.createApp({
    data() {
        return {
            value: {
                usuario: '',
                usuarioRecupera: '',
                password: ''
            },
            disabled: {
                entrar: false
            },
            show: {
                inicio: false
            }
        }
    },
    methods: {
        acceso(evt) {
            evt.preventDefault();

            let msj = '';
            if (this.value.usuario.trim() === '') {
                msj += '<li>Ingrese el usuario</li>';
            }
            if (this.value.password.trim() === '') {
                msj += '<li>Ingrese el password</li>';
            }

            if (msj === '') {
                setLoader();
                this.disabled.entrar = true;
                axios.post(url + 'Seguridad/Acceso', {
                    usuario: this.value.usuario.trim(),
                    password: this.value.password.trim()
                }).then(res => {
                    this.disabled.entrar = false;

                    sessionStorage.setItem('tok_RedOselDistribuidores', res.data.token);
                    document.location.assign(url + 'RedOsel/Avisos');
                    //setLoader('hide');
                }).catch(err => {
                    validError(err);
                    this.disabled.entrar = false;
                });
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }

        },
        entrar() {
            document.location.assign(`${url}RedOsel/Avisos`);
        },
        set() {
            return new Promise((success, fail) => {
                axios.get(`${url}Seguridad/Set`, {}).then(_ => {
                    success('')
                }).catch(_ => {
                    fail('')
                })
            });
        },
        abrirRecupera() {
            this.value.usuarioRecupera = '';
            modalRecuperacion.show();
        },
        enviaSolicitud() {
            if (this.value.usuarioRecupera.trim() === '') {
                alerts.error('Ingrese el usuario');
                return;
            }

            setLoader();
            axios.post(`${url}Inicio/RestablecerContrasena`, {
                usuario: this.value.usuarioRecupera.trim()
            }).then(_ => {
                modalRecuperacion.hide();
                alerts.success('Se envió un correo electrónico para el seguimiento de su solicitud');
                setLoader('hide');
            }).catch(_ => {
                alerts.error('Hubo un error en la solicitud', 'Reintente de nuevo')
                setLoader('hide');
            });
        }
    },
    created() {
        if (sessionStorage.getItem('tok_RedOselDistribuidores') === null) {
            this.show.inicio = true;
        } else {
            this.set().then(_ => {
                this.show.inicio = false;
            }).catch(() => {
                sessionStorage.clear('tok_RedOselDistribuidores');
                this.show.inicio = true;
            });        
        }
    },
    mounted() {
        modalRecuperacion = new bootstrap.Modal(this.$refs.modalRecuperacion);
        //sessionStorage.removeItem('tok_RedOselDistribuidores');
    }
}).mount('#appLogin');



const setLoader = (action = 'show') => {
    try {
        const a = document.querySelectorAll('.cargando-c')
        if (action === 'show') {
            a.forEach(key => {
                key.style.display = 'block'
            })
        } else {
            a.forEach(key => {
                key.style.display = 'none'
            })
        }
    } catch (e) {
        console.error('ERROR LOADER\n', e)
    }
};



function validError(error) {
    if (!error.hasOwnProperty('response')) {
        setLoader('hide');
        console.error(error);
        alerts.error(error);
        return;
    }

    if (error.response.status === 401) {
        setLoader('hide');
        alerts.info('Sesión Terminada');
        setTimeout(() => {
            document.location.href = url;
        }, 1000);
        return;
    }

    if (error.hasOwnProperty('isAxiosError')) {
        let errorMessage = error.request?.responseText ?? error.message;
        console.error(errorMessage);
        alerts.error('Error', errorMessage);
    } else {
        console.error(error);
        alerts.error('Error', error?.response?.data ?? error.message);
    }
    setLoader('hide');
};



window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});