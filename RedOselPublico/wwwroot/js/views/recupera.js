let url = "";

if (document.location.port == "") {
    url = document.location.protocol + "//" + document.location.hostname + "/redoselpublico/";
} else {
    url = document.location.protocol + "//" + document.location.hostname + ":" + document.location.port + "/";
}


Vue.createApp({
    data() {
        return {
            value: {
                password: '',
                confirma: '',
                titulo: 'Restablecimiento de contraseña',
                correo: '',
                nuevoCorreo: ''
            },
            show: {
                salir: false,
                correo: false,
                inputCorreo: false
            }
        }
    },
    methods: {
        activaCorreo() {
            this.show.inputCorreo = true;
        },
        actualiza() {
            let msj = '';


            if (this.show.inputCorreo && this.value.nuevoCorreo.trim() !== '' && this.value.nuevoCorreo.trim().indexOf('@') === -1) {
                msj += '<li>Ingrese un correo electrónico válido</li>'; 
            }
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
                setLoader();

                var utilUrls = new URL(document.location.href);
                var token = utilUrls.searchParams.get("token");
                var ruta = sessionStorage.getItem('actualiza') === null ? 'Inicio/CambiaContrasena' : 'ActualizaC'
                //const tk = sessionStorage.getItem('tok_RedOselDistribuidores');

                axios.post(url + ruta, {
                    token: token,
                    contrasena: this.value.password,
                    correo: this.value.nuevoCorreo.trim()
                }).then(res => {
                    setLoader('hide')
                    if (sessionStorage.getItem('actualiza') === null) {
                        alerts.success('El cambio fue realizado', 'Se redigirá al inicio de sesión');
                        setTimeout(a => {
                            setLoader();
                            document.location.assign(url);
                        }, 3000)
                    } else {
                        alerts.success('El cambio fue realizado', 'Se redigirá a la sección de Avisos');
                        setTimeout(a => {
                            setLoader();
                            document.location.assign(`${url}RedOsel/Avisos`);
                        }, 3000)
                    }                    
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
        salir() {
            setLoader();
            axios.post(`${url}Seguridad/Salir`, {}).then(_ => {
                sessionStorage.removeItem('tok_RedOselDistribuidores');
                setTimeout(a => {
                    document.location.assign(`${url}`);
                }, 50);
            }).catch(_ => {
                alerts.error('Hubo un error, intente de nuevo');
            })   
        },
        async refreshAccessToken() {
            try {

                const response = await axios.post(`${url}Seguridad/Rsh`, {}, {
                    skipAuth: true, // Custom property to skip the interceptor
                });
                const ds = response.data;

                if (ds.hasOwnProperty('token')) {
                    // Save the new access token
                    sessionStorage.setItem('tok_RedOselDistribuidores', ds.token);
                    this.intentos++;
                    return true;
                }

                return false;
            } catch (error) {
                alerts.info('Sesión terminada');
                setTimeout(a => {
                    window.location.href = url; // Redirect to root if refresh fails
                }, 1000)
                return;
            }
        },
        initializeAxiosInterceptors() {
            axios.interceptors.request.use(
                (config) => {
                    const token = sessionStorage.getItem('tok_RedOselDistribuidores');
                    if (!config.skipAuth && token && config.method === 'post') {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            axios.interceptors.response.use(
                (response) => response, // Return successful responses
                async (error) => {
                    const originalRequest = error.config;

                    // Handle 401 Unauthorized
                    if (error.response && error.response.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true; // Mark as retried
                        try {
                            if (await this.refreshAccessToken()) {
                                // Refresh the token
                                this.intentos = 0;
                                originalRequest.headers.Authorization = `Bearer ${sessionStorage.getItem('tok_RedOselDistribuidores')}`; // Update the request with the new token
                                return axios(originalRequest); // Retry the original request
                            }
                        } catch (refreshError) {
                            alerts.info('Sesión terminada');
                            setTimeout(a => {
                                window.location.href = url; // Redirect to root if refresh fails
                                //return Promise.reject(error); // Reject other errors
                            }, 1000)
                        }
                    }

                    return Promise.reject(error); // Reject other errors
                }
            );
        },
    },
    created() {
        if (sessionStorage.getItem('actualiza') !== null) {
            this.value.titulo = 'Actualización de Contraseña';
            this.value.correo = sessionStorage.getItem('correo');
            this.show.salir = true;
            this.show.correo = true;

            this.initializeAxiosInterceptors();
        }
    },
    mounted() {
    }
}).mount('#appRecupera');



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