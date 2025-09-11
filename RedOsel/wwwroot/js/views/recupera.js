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
                password: '',
                confirma: ''
            }
        }
    },
    methods: {
        actualiza() {
            let msj = '';
            if (this.value.password.trim() === '') {
                msj += '<li>Ingrese la nueva contraseña</li>';
            }
            if (this.value.password.trim() !== '' && this.value.confirma.trim() === '') {
                msj += '<li>Confirme la contraseña</li>';
            }


            if (this.value.password.trim() !== '' && this.value.confirma.trim() !== '') {
                if (this.value.password.trim() !== this.value.confirma.trim()) {
                    msj += '<li>La contraseña y su confirmación no son iguales</li>';
                }

                let result1 = this.evalPassword(this.value.password.trim());
                let result2 = this.evalPassword(this.value.confirma.trim())

                if (!result1.strong) {
                    msj += '<li>La contraseña no cumple lo siguiente:<ol class="mb-1">';
                    msj += result1.message + '</ol></li>';
                }
                if (!result2.strong) {
                    msj += '<li>La confirmación de contraseña no cumple lo siguiente:<ol class="mb-1">';
                    msj += result1.message + '</ol></li>';
                }
            }

            if (msj === '') {
                $('.cargando-c').show();

                var utilUrls = new URL(document.location.href);
                var token = utilUrls.searchParams.get("token");

                axios.post(url + 'Administracion/CambiaContrasena', {
                    token: token,
                    contrasena: this.value.password
                }).then(res => {
                    $('.cargando-c').hide();
                    alerts.success('El cambio fue realizado', 'Se redigirá al inicio de sesión');
                    setTimeout(a => {
                        $('.cargando-c').show();
                        document.location.assign(url);
                    }, 3000)
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        evalPassword(password) {
            //const password = this;
            let msj = '';
            // Criterios
            const hasMinLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password); // Al menos una letra mayúscula
            const hasLowercase = /[a-z]/.test(password); // Al menos una letra minúscula
            const hasNumber = /\d/.test(password);       // Al menos un número
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Opcional: caracteres especiales
            let strong = true;

            // Evaluar la fortaleza
            if (!hasMinLength) {
                strong = false;
                msj += "<li>La contraseña debe tener al menos 8 caracteres.</li>";
            }
            if (!hasUppercase) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos una letra mayúscula.</li>"
            }
            if (!hasLowercase) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos una letra minúscula.</li>"
            }
            if (!hasNumber) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos un número.</li>"
            }
            if (!hasSpecialChar) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos un caracter especial.</li>"
            }


            return { strong: strong, message: msj };
        },
    },
    mounted() {

    }
}).mount('#appRecupera');

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